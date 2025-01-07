export const mockOut = () => {
  let logOut = '';
  let errOut = '';
  return {
    log: (s: string) => (logOut += `${s}\n`),
    error: (s: string) => (errOut += `${s}\n`),
    getLogOut: () => logOut,
    getErrOut: () => errOut,
  };
};

export const mockrl = (answer: string) => {
  return {
    question: async () => Promise.resolve(answer),
    close: () => {},
  };
};

export const mockFile = (path: string, contents = '') => {
  const read = async () => {
    if (!contents) {
      throw new Error();
    }
    return contents;
  };
  const write = async (val: string) => {
    contents = val;
  };
  const exists = () => !!contents;

  return { read, write, exists, path };
};

export const makeVstorageMock = (records: { [key: string]: any }) => {
  const queryCounts = {};
  const vstorage = {
    readLatest: async (path: string) => {
      queryCounts[path] = (queryCounts[path] ?? 0) + 1;
      return records[path];
    },
  };

  return { vstorage, getQueryCounts: () => queryCounts };
};

export const makeFetchMock = get => {
  const queryCounts = {};
  const fetch = async (path: string) => {
    queryCounts[path] = (queryCounts[path] ?? 0) + 1;
    return { json: async () => get(path) };
  };

  return { fetch, getQueryCounts: () => queryCounts };
};

export const makeMockSigner = () => {
  let signedArgs;
  const signer = {
    signAndBroadcast: async (...args) => {
      signedArgs = harden(args);
      return { code: 0, transactionHash: 'SUCCESSHASH' };
    },
  };

  return { getSigned: () => signedArgs, signer };
};
