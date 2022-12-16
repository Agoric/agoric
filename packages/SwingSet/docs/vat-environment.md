# The Vat Runtime JS Environment

SwingSet JavaScript _vats_ are containers that run code in a confined and resource-limited environment, with orthogonal persistence and eventual-send-based access to external resources.

The specific flavor of JavaScript provided by a vat is a frozen SES `Compartment`, with a few additions.

Most JS environments (Node.js, web browsers) provide a combination of the baseline JavaScript [language globals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects) (`Object`, `Array`, etc) plus some number of "host objects". [Web browsers](https://developer.mozilla.org/en-US/docs/Web/API) offer things like `window`, `fetch`, `WebAssembly`, and `localStorage`, while [Node.js includes](https://nodejs.org/dist/latest-v14.x/docs/api/globals.html) ones like `require`, `process`. and `Buffer`. In general, all IO is provided by the host objects.

SES is a safe deterministic subset of "strict mode" JavaScript, which means it does not include any of these IO objects (they would provide ambient authority, which is not "safe"). It also modifies a few built-in objects to remove non-determinism.

The full list of SES globals (as of SES-0.8.0) is defined in [the SES source code](https://github.com/Agoric/SES-shim/blob/SES-v0.8.0/packages/ses/src/whitelist.js). It includes the core language objects: `Object`, `Array`, `Number`, `Map` and `WeakMap`, `Number`, `BigInt`, and others. This is a subset of the globals defined by the baseline JavaScript language specification.

This includes `Math`, but `Math.random()` is disabled (calling it throws an error) as an obvious source of non-determinism. Likewise `Date` is included, but `Date.now()` returns `NaN`, and `new Date(nonNumber)` or `Date(anything)` return a `Date` that stringifies to `"Invalid Date"`. The remaining `Math` and `Date` features are purely computational and deterministic.

Much of the `Intl` package, and some locale-specific portion of other objects (e.g. `Number.prototype.toLocaleString`) has results which depend upon which locale is configured, and that will vary from one process to another. The way we handle this is still in development. Either these functions will be disabled, or they will act as if they run on a host with a single fixed locale defined by the SES specification.

As SES is on the JavaScript standards track, it includes other proposed features. If those features become standards, future JS environments will include them as global objects. So the current SES shim also makes those global objects available.

## Additions

`console` is available to vat code as a deliberate addition. It is not part of JavaScript, but it's so important for debugging that leaving it out would cause too much confusion. Note that the exact behavior of `console.log` is up to the host program; it is not guaranteed to be displayed to the operator. Applications that want to let vats write to `process.stdout` must somehow provide that authority directly. From a vat's point of view, `console` is frozen and powerless.

`harden` is available as a global. It freezes the API surface (enumerable data properties) of an object. For more details, see [the `harden` package](https://github.com/Agoric/SES-shim/blob/SES-v0.8.0/packages/harden/README.md).

`HandledPromise` is also a global. The `E` wrapper (`E(target).methodname(args)`) can be imported as `import { E } from '@endo/eventual-send`. These two are defined by the TC39 [Eventual-Send Proposal](https://github.com/tc39/proposal-eventual-send).

`Compartment` (a [part of SES](https://github.com/Agoric/SES-shim/tree/SES-v0.8.0/packages/ses#compartment)) is a global. Vat code runs inside a `Compartment`, but vat code can create sub-compartments to host other code (with different globals or transforms).

Note that these child compartments get `harden` and `Compartment`, but they won't include other endowments (like `console` or `HandledPromise`) unless you explicitly provide them. If the parent compartment was metered, any child compartments will also be metered (this is inescapable). Child compartments will _not_ be frozen by default: see "Frozen globalThis" below for details.

## Removals

Nearly all existing JS code was written to run under Node.js or inside a browser, so it's easy to conflate the features of these environments with those of the core language itself. As a result, many JavaScript developers may be surprised to learn that, for example, `Buffer` and `require` are not actually a part of the language, but instead are Node.js additions.

Most of the Node.js-specific [global objects](https://nodejs.org/dist/latest-v14.x/docs/api/globals.html) are not available within a vat. These include:

- `queueMicrotask`
- `Buffer` (consider using TypedArray instead, but see below)
- `setImmediate`/`clearImmediate`: These are not available, but you can generally replace `setImmediate(fn)` with `Promise.resolve().then(_ => fn())` to defer execution of `fn` until some time after the current event/callback has finished processing. But be aware that won't run until after all _other_ ready Promise callbacks are executed. There are two queues: the "IO queue" (accessed by `setImmediate`), and the "Promise queue" (accessed by Promise resolution), and SES code is only allowed to add to the Promise queue. Note that the Promise queue is higher-priority than the IO queue, so no IO or timers will be handled until the Promise queue is empty.
- `setInterval` and `setTimeout` (and `clearInterval`/`clearTimeout`): any notion of time must come from exchanging messages with external timer services (the SwingSet environment provides a `TimerService` object to the bootstrap vat for this purpose, which can share that object with other vats if it chooses)
- `global` is not defined, use `globalThis` instead (and remember that it is frozen)
- `process` is not available, e.g. `process.env` for accessing the process's environment variables, or `process.argv` for the argument array
- `URL`, `URLSearchParams` are not available
- `WebAssembly` is not available, as neat as that would be
- `TextEncoder` and `TextDecoder` are not available

Some names look like globals, but are really part of the module-defining tools: imports, exports, and metadata. Modules start as files on disk, but are then bundled together into an archive before being loaded into a vat. Several standard functions are used by the bundling tool to locate all the other modules that must be included. These are not a part of SES, but are allowed in module source code, and are translated or removed before execution finally happens. Those names are:

- `import` and `export` syntax are allowed in ESM-style modules (which is preferred over CommonJS). These are not globals per se, but rather top-level syntax which defines the module graph.
- `require`, `module`, `module.exports`, and `exports` are allowed in CommonJS-style modules, and should work as expected, however new code should be written as ESM modules. They are either consumed by the bundling process, provided (in some form) by the execution environment, or otherwise rewritten to work sensibly
- `__dirname` and `__filename` are not provided
- The dynamic import expression (`await import('name')`) is currently prohibited in vat code, but a future SES implementation may allow it.

Node.js has a [large collection](https://nodejs.org/dist/latest-v14.x/docs/api/) of "built-in modules", like `http` and `crypto`. Some are clearly platform-specific (like `v8`), while others are not so obvious (`stream`). All of these are accessed by importing a module (`const v8 = require('v8')` in CommonJS modules, or `import v8 from 'v8'` in ESM modules). These modules are built out of native code (C++), not plain JS.

None of these built-in modules are available to vat code. `require` or `import` can be used on modules that contain pure JS, but not on modules that include native code. To allow a vat to exercise authority which comes from a built-in module, you will have to write a _device_, give that device an endowment with the built-in module's functions, then have the vat send messages to the device.

Browser environments also have a huge list of [other features](https://developer.mozilla.org/en-US/docs/Web/API) which are presented as names in the global scope (some of which were also added to Node.js). None of these are available in a SES environment. The most surprising removals include `atob`, `TextEncoder`, and `URL`.

`debugger` is a first-class JavaScript statement, and behaves as expected in vat code.

## Shim Limitations

The [shim](https://github.com/Agoric/SES-shim/) that provides our SES environment is not as fully-featured as a native implementation. As a result, some forms of code cannot be used yet. These restrictions, described in the following sections, should be lifted once the JS engine you use can provide SES natively.

### HTML Comments

JavaScript parsers may or may not recognize HTML comments within source code, potentially leading to different behavior on different engines. For safety, the SES shim rejects any source code which contains a comment open (`<!--`) or close (`-->`) sequence. However the filter uses a regular expression, not a full parser, so it will unnecessarily reject any source code containing the string `<!--` (or `-->`), even if it does not actually mark a comment.

### Dynamic Import Expressions

One active JS feature proposal would add a "dynamic import" expression: `await import('path')`. If the engine implements this, vat code might be able to bypass the `Compartment`'s module map. For safety, the SES shim rejects code that looks like it uses this feature. The regular expression that looks for this pattern can be confused into falsely rejecting legitimate code, usually by having the word `import` in a comment at the end of a line.

### Direct Eval Expressions

A _direct eval_, invoked like `eval(code)`, behaves as if `code` were expanded in place. The evaluated code sees the same scope as the `eval` itself sees, so the `code` in:

```js
function foo(code) {
  const x = 1;
  eval(code);
}
```

gets to reference `x`. If you perform a direct eval, you cannot hide your internal authorities from the code you're evaluating.

In contrast, an _indirect eval_ only gets the global scope, not the local scope. In a safe SES environment, indirect eval is a useful and common tool. The evaluated code can only access global objects, and those are all safe (and frozen). The only bad thing an indirect eval can do is consume unbounded CPU or memory. Once you've evaluated that code, you can invoke it with arguments to give it as many or as few authorities as you like.

The most common way to invoke an indirect eval is `(1,eval)(code)`.

The SES shim cannot correctly emulate a direct eval. If it tried, it would perform an indirect eval. This could be pretty confusing, because the code might not actually use objects from the local scope. You might not notice the problem until some later change altered the behavior.

To avoid confusion, the shim uses a regular expression to reject code that looks like it is performing a direct eval. This regexp is not complete (you can trick it into performing a direct eval anyway), but that's ok, because our goal is merely to guide people away from confusing behaviors early in their development process.

This regexp will falsely reject occurrences inside static strings and comments.

## Other Changes

### Frozen globalThis

Vats run in a `Compartment` whose `globalThis` object is frozen. If the global object were mutable, it would provide an ambient communication channel. To use this channel, one side could set `globalThis.heyBuddyAreYouOutThere = 'exfiltrated message'`, and the other side could periodically read it. The presence of this channel would violate one of the rules of object-capability security: objects may only communicate through references. Freezing `globalThis` preserves this rule.

Vats can create new `Compartment`s, and they get to decide if the new compartment is meant to support ocap security or not. If so, they should run `harden(compartment.globalThis)` after building `compartment` but before loading any untrusted code into it.

### Frozen Primordials

SES freezes the _primordials_: the built-in JavaScript objects such as `Object`, `Array`, and `RegExp`, as well as their prototype chains. This prevents malicious code from changing the behavior of built-ins in surprising ways (imagine `Array.prototype.push` being changed to deliver a copy of its argument to the attacker, or simply ignore certain values). It also prevents the use of, for example, `Object.heyBuddy` as an ambient communication channel.

Both frozen primordials and a frozen `globalThis` will break a few JS libraries that add new features to built-in objects (shims/polyfills). For shims which merely add properties to `globalThis`, it may be possible to load these in a new non-frozen `Compartment`. Shims which modify primordials only work if you build new (mutable) wrappers around the default primordials and allow the shims to modify those wrappers instead.

## Library Compatibility

Vat code can use `import` or `require()` to import other libraries, as long as those libraries consist of purely JS code, and are compatible with the SES environment. This includes a significant portion of the NPM registry.

However, many NPM packages use built-in Node.js modules. If they use these at import time (in their top-level code), the package cannot be used by vat code: the vat will fail to load at all. If they wait until runtime to use the built-in features, then the package can load, but might fail later when a function is invoked that accesses the missing functionality. As a result, some NPM packages may be partially compatible; you can use them as long as you don't invoke certain features.

The same is true for NPM packages that use missing globals, or attempt to modify frozen primordials.

The [SES wiki](https://github.com/Agoric/SES-shim/wiki) keeps track of compatibility reports for NPM packages, including potential workarounds.
