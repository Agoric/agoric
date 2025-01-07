/* global setTimeout */
// NOTE: Runs outside SES

/* global WebSocket fetch document window walletFrame localStorage */
const RECONNECT_BACKOFF_SECONDS = 3;
// Functions to run to reset the HTML state to what it was.
const resetFns = [];
let inpBackground;

let accessTokenParams;
let hasAccessToken;

function getAccessToken() {
  // Fetch the access token from the window's URL.
  accessTokenParams = `?${window.location.hash.slice(1)}`;
  hasAccessToken = new URLSearchParams(accessTokenParams).get('accessToken');

  try {
    if (hasAccessToken) {
      // Store the access token for later use.
      localStorage.setItem('accessTokenParams', accessTokenParams);
    } else {
      // Try reviving it from localStorage.
      accessTokenParams = localStorage.getItem('accessTokenParams') || '?';
      hasAccessToken = new URLSearchParams(accessTokenParams).get(
        'accessToken',
      );
    }
  } catch (e) {
    console.log('Error fetching accessTokenParams', e);
  }

  // Now that we've captured it, clear out the access token from the URL bar.
  window.location.hash = '';
  window.addEventListener('hashchange', _ev => {
    // See if we should update the access token params.
    const atp = `?${window.location.hash.slice(1)}`;
    const hat = new URLSearchParams(atp).get('accessToken');

    if (hat) {
      // We have new params, so replace them.
      accessTokenParams = atp;
      hasAccessToken = hat;
      localStorage.setItem('accessTokenParams', accessTokenParams);
    }

    // Keep it clear.
    window.location.hash = '';
  });
}
getAccessToken();

if (!hasAccessToken) {
  // This is friendly advice to the user who doesn't know.
  if (
    // eslint-disable-next-line no-alert
    window.confirm(
      `\
You must open the Agoric Wallet+REPL with the
    agoric open --repl
command line executable.

See the documentation?`,
    )
  ) {
    window.location.href =
      'https://agoric.com/documentation/getting-started/agoric-cli-guide.html#agoric-open';
  }
}

function run() {
  const disableFns = []; // Functions to run when the input should be disabled.
  resetFns.push(() => (document.querySelector('#history').innerHTML = ''));

  let nextHistNum = 0;
  let inputHistoryNum = 0;

  async function call(req) {
    const res = await fetch(`/private/repl${accessTokenParams}`, {
      method: 'POST',
      body: JSON.stringify(req),
      headers: { 'Content-Type': 'application/json' },
    });
    const j = await res.json();
    if (j.ok) {
      return j.res;
    }
    throw Error(`server error: ${JSON.stringify(j.rej)}`);
  }

  const protocol = window.location.protocol.replace(/^http/, 'ws');
  const socketEndpoint = `${protocol}//${window.location.host}/private/repl${accessTokenParams}`;
  const ws = new WebSocket(socketEndpoint);

  ws.addEventListener('error', ev => {
    console.log(`ws.error`, ev);
    ws.close();
  });

  ws.addEventListener('close', _ev => {
    for (const fn of disableFns) {
      fn();
    }
    console.log(`Reconnecting in ${RECONNECT_BACKOFF_SECONDS} seconds`);
    setTimeout(run, RECONNECT_BACKOFF_SECONDS * 1000);
  });

  const commands = [];

  function linesToHTML(lines) {
    return lines
      .split('\n')
      .map(
        l =>
          l
            // These replacements are for securely inserting into .innerHTML, from
            // https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#rule-1-html-encode-before-inserting-untrusted-data-into-html-element-content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')

            // These two replacements are just for word wrapping, not security.
            .replace(/\t/g, '  ') // expand tabs
            .replace(/ {2}/g, ' &nbsp;'), // try preserving whitespace
      )
      .join('<br />');
  }

  function addHistoryRow(h, histnum, kind, value, msgs) {
    if (histnum >= 0) {
      const row = document.createElement('div');
      row.className = `${kind}-line`;
      const label = document.createElement('div');
      label.textContent = `${kind}[${histnum}]`;
      const content = document.createElement('div');
      content.id = `${kind}-${histnum}`;
      content.innerHTML = linesToHTML(`${value}`);
      row.appendChild(label);
      row.appendChild(content);
      h.append(row);
    }
    // Write out any messages attached to this line.
    const row = document.createElement('div');
    row.className = 'msg-line';
    const m = document.createElement('div');
    m.id = `msg-${kind}-${histnum}`;
    if (msgs) {
      m.innerHTML = linesToHTML(`${msgs}`);
    }
    row.appendChild(document.createElement('div'));
    row.appendChild(m);
    h.append(row);
  }

  function addHistoryEntry(histnum, command, result, consoles) {
    const h = document.getElementById('history');
    addHistoryRow(h, histnum, 'command', command, consoles.command || '');
    addHistoryRow(h, histnum, 'history', result, consoles.display || '');
    commands[histnum] = command;
  }

  function updateHistory(histnum, command, result, consoles = {}) {
    const h = document.getElementById('history');
    const isScrolledToBottom =
      h.scrollHeight - h.clientHeight <= h.scrollTop + 1;
    if (nextHistNum <= histnum) {
      nextHistNum = histnum + 1;
    }
    const m1 = document.getElementById(`msg-command-${histnum}`);
    const m2 = document.getElementById(`msg-history-${histnum}`);
    if (m1 || m2) {
      const c = document.getElementById(`command-${histnum}`);
      const h1 = document.getElementById(`history-${histnum}`);
      if (c) {
        c.innerHTML = linesToHTML(`${command}`);
      }
      if (m1) {
        m1.innerHTML = linesToHTML(`${consoles.command}`);
      }
      if (h1) {
        h1.innerHTML = linesToHTML(`${result}`);
      }
      if (m2) {
        m2.innerHTML = linesToHTML(`${consoles.display}`);
      }
    } else {
      addHistoryEntry(histnum, command, result, consoles);
    }
    if (isScrolledToBottom) {
      setTimeout(() => (h.scrollTop = h.scrollHeight), 0);
    }
  }

  function setNextHistNum(max = 0) {
    const thisHistNum = nextHistNum;
    nextHistNum = Math.max(nextHistNum, max);
    document.getElementById('historyNumber').textContent = nextHistNum;
    inputHistoryNum = nextHistNum;
    commands[inputHistoryNum] = '';
    return thisHistNum;
  }

  function handleMessage(obj) {
    // we receive commands to update result boxes
    if (obj.type === 'updateHistory') {
      // these args come from calls to vat-http.js updateHistorySlot()
      updateHistory(obj.histnum, obj.command, obj.display, obj.consoles);
    } else {
      console.log(`unknown WS type in:`, obj);
    }
  }

  // history updates (promises being resolved) are delivered by websocket
  // broadcasts
  ws.addEventListener('message', ev => {
    try {
      // console.debug('ws.message:', ev.data);
      const obj = JSON.parse(ev.data);
      handleMessage(obj);
    } catch (e) {
      console.log(`error handling message`, e);
    }
  });

  ws.addEventListener('open', _ev => {
    console.debug(`ws.open!`);
    while (resetFns.length > 0) {
      const fn = resetFns.shift();
      try {
        fn();
      } catch (e) {
        console.error(`error resetting`, e);
      }
    }
    call({ type: 'getHighestHistory' })
      .then(res => {
        setNextHistNum(res.highestHistory + 1);
        // console.debug(`nextHistNum is now ${nextHistNum}`, res);
      })
      .then(async _ => call({ type: 'rebroadcastHistory' }))
      .catch(_ => ws.close());
  });

  const inp = document.getElementById('input');

  function inputHistory(delta) {
    const nextInput = inputHistoryNum + delta;
    if (nextInput < 0 || nextInput >= commands.length) {
      // Do nothing.
      return;
    }
    inputHistoryNum = nextInput;
    inp.value = commands[inputHistoryNum];
  }

  function submitEval() {
    const command = inp.value;
    console.debug('submitEval', command);
    const number = setNextHistNum(nextHistNum + 1);
    updateHistory(number, command, `sending for eval`);
    commands[commands.length - 1] = inp.value;
    commands[commands.length] = '';
    inp.value = '';
    void call({ type: 'doEval', number, body: command });
  }

  function inputKeyup(ev) {
    switch (ev.key) {
      case 'Enter':
        submitEval();
        return false;

      case 'ArrowUp':
        inputHistory(-1);
        return false;

      case 'ArrowDown':
        inputHistory(+1);
        return false;

      case 'p':
        if (ev.ctrlKey) {
          inputHistory(-1);
          return false;
        }
        break;

      case 'n':
        if (ev.ctrlKey) {
          inputHistory(+1);
          return false;
        }
        break;

      // Do the standard behaviour.
      default:
    }
    commands[commands.length - 1] = inp.value;
    return true;
  }
  inp.addEventListener('keyup', inputKeyup);
  disableFns.push(() => inp.removeEventListener('keyup', inputKeyup));

  if (inpBackground === undefined) {
    inpBackground = inp.style.background;
  }
  disableFns.push(() => (inp.style.background = '#ff0000'));
  resetFns.push(() => (inp.style.background = inpBackground));

  document.getElementById('go').onclick = submitEval;
  disableFns.push(() =>
    document.getElementById('go').setAttribute('disabled', 'disabled'),
  );
  resetFns.push(() =>
    document.getElementById('go').removeAttribute('disabled'),
  );
}

run();

// Display version information, if possible.
const fetches = [];
const fgr = fetch('/git-revision.txt')
  .then(async resp => {
    if (resp.status < 200 || resp.status >= 300) {
      throw Error(`status ${resp.status}`);
    }
    return resp.text();
  })
  .then(text => {
    return text.trimRight();
  })
  .catch(e => {
    console.log(`Cannot fetch /git-revision.txt`, e);
    return '';
  });
fetches.push(fgr);

const fpj = fetch('/package.json')
  .then(async resp => resp.json())
  .catch(e => {
    console.log('Cannot fetch /package.json', e);
    return {};
  });
fetches.push(fpj);

// an optional `w=0` GET argument will suppress showing the wallet
if (
  hasAccessToken &&
  new URLSearchParams(window.location.search).get('w') !== '0'
) {
  fetch(`wallet/${accessTokenParams}`)
    .then(resp => {
      if (resp.status < 200 || resp.status >= 300) {
        throw Error(`status ${resp.status}`);
      }
      walletFrame.style.display = 'block';
      walletFrame.src = `wallet/#${accessTokenParams.slice(1)}`;
    })
    .catch(e => {
      console.log('Cannot fetch wallet/', e);
    });
}

Promise.all(fetches)
  .then(([rev, pjson]) => {
    const gr = document.getElementById('package_git');
    if (gr) {
      gr.innerText = rev;
    }
    const pn = document.getElementById('package_name');
    if (pn) {
      pn.innerText = pjson.name || 'cosmic-swingset';
    }
    const pv = document.getElementById('package_version');
    if (pv) {
      pv.innerText = pjson.version || 'unknown';
    }
    const pr = document.getElementById('package_repo');
    if (pr) {
      const repo = pjson.repository || 'https://github.com/Agoric/agoric-sdk';
      const cleanRev = rev.replace(/-dirty$/, '');
      const href = rev ? `${repo}/commit/${cleanRev}` : repo;
      pr.setAttribute('href', href);
    }
  })
  .catch(e => console.log(`Error setting package metadata:`, e));
