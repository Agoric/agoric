This document describes the design of the swingset configuration
object, which specifies the vats a swingset should be initially
composed from.

Four functions importable from the `'@agoric/swingset-vat'` module
make reference to the configuration object:

- `loadSwingsetConfigFile` reads a configuration object from a JSON
  file, parses and verifies it and then returns it in canonical form.

- `loadBaseDir` scans a directory for the files named `bootstrap.js`
  and `vat-*.js` and then composes and returns a corresponding
  configuration object.

- `buildVatController` and `initializeSwingset` each accept a configuration
  object as their first parameter, the specification of the swingset that the
  function will create.

The configuration object takes this form:

```
config = {
  defaultManagerType: MANAGERTYPESTRING?
  includeDevDependencies: BOOL?
  defaultReapInterval: NUMBER|'never'?
  relaxDurabilityRules: BOOL?
  snapshotInitial: NUMBER?
  snapshotInterval: NUMBER?
  pinBootstrapRoot: BOOL?
  vats: {
    VATNAME: {
      sourceSpec: PATHSTRING?
      bundleSpec: PATHSTRING?
      bundleHash: HASHSTRING?
      bundleName: NAMESTRING?
      bundle: CODESTRING?
      parameters: DATAOBJECT?
      endowments: DATAOBJECT?
      creationOptions: {
        enablePipelining: BOOL?
        name: STRING?
        enableDisavow: BOOL?
        managerType: MANAGERTYPESTRING?
        metered: BOOL?
        reapInterval: NUMBER|'never'?
        enableSetup: BOOL?
        critical: BOOL?
        useTranscript: BOOL?
        virtualObjectCacheSize: NUMBER?
      }?
    }+
  }
  bootstrap: VATNAME?
  bundles: {
    BUNDLENAME: {
      sourceSpec: PATHSTRING?
      bundleSpec: PATHSTRING?
      bundle: CODESTRING?
    }*
  }?
  devices: {
    DEVICENAME: {
      sourceSpec: PATHSTRING?
      bundleSpec: PATHSTRING?
      bundleHash: HASHSTRING?
      bundleName: NAMESTRING?
      bundle: CODESTRING?
      parameters: DATAOBJECT?
      endowments: DATAOBJECT?
      creationOptions: {
        unendowed: BOOL?
      }?
    }*
  }?
}
```

This object describes what we will here call a "vat group": one or more vats
organized together in some purposeful way. The configuration object is a pure
data object that can be serialized as JSON, and so stored in a file, loaded from
a file, passed in a message over the network, etc., in addition to being
something that can be passed around as an object internally.

The `vats` property describes the vats in the vat group, in the form
of an object with one entry property per vat keyed to the vat's name
(the name is scoped to the vat group). A vat group must contain at
least one vat.

The `bundles` object describes vat bundles independent of which vat
they are associated with. In particular, this makes those bundles
available for dynamic vat creation without requiring them to actually
be instantiated as vats unless and until they are needed.

The `devices` object similarly describes devices that will be part of
the swingset. Currently these are passed as initialization parameters
to the bootstrap vat, though in theory they could be configured as
endowments to other vats if we felt so inclined (I presume that at the
moment we do not). IMPORTANT NOTE: the `devices` property as described
here is aspirational and is not yet supported. At the moment devices
can only be configured by code that generates device entries in the
config object directly, since these must contain unserializable objects.

The `bootstrap` property, if present, names the vat that is to be the
bootstrap vat. If this property is missing, there will be no
bootstrap vat, which may be disallowed in certain use cases.

The `pinBootstrapRoot` property, if `true`, causes the bootstrap vat's root
object's reference count to be artificially incremented by one as part of
setting it up, so that the bootstrap root won't be garbage collected even if it
becomes nominally unreferenced. The bootstrap vat's root will generally be
garbage collected after it finishes executing the `bootstrap` method unless that
method formally exports the root object to some other vat. However, the host
retains the ability to deliver messages to it directly (for example, using
`controller.queueToVatRoot()`), so if the host wants the bootstrap root to
remain available to provide additional services after bootstrapping, this flag
should be set. Defaults to `false`.

The `defaultManagerType` property indicates what sort of vat worker to run vats
in if they are not specifically configured otherwise. Currently allowed
manager types are `'local'`, `'nodeWorker'`, `'node-subprocess'`, and
`'xs-worker'`. Of these, only `'local'` and `'xs-worker'` are fully supported;
the others are experimental. If omitted, it defaults to `'local'`.

The `includeDevDependencies` property, if `true`, instructs the bundler which
creates bundles to include the SwingSet package's dev dependencies as well as
its regular runtime depencies in any bundles that it creates. Defaults to
`false`.

The `defaultReapInterval` property specifies the default frequency with which
the kernel should prompt each vat (by delivering it a `bringOutYourDead`
directive) to perform garbage collection and notify the kernel of any dropped or
released references that result. This should either be an integer, indicating
the number of deliveries that should be made to the vat before reaping, or the
string `'never'`, indicating that such activity should never happen. If
defaults (yes, the default has a default) to 1.

The `relaxDurabilityRules` property, if `true`, allows vat code running inside
this swingset to store non-durable references inside durable objects and stores
for testing purposes. It defaults to `false`, because this is a dangerous,
development-time only feature; any vat using it will be left in a corrupted
state after delivery of a `stopVat` directive.

The `snapshotInterval` property is the frequency (measured in numbers of
deliveries) with which `'xs-worker'` vats will perform snapshots to disk of
their in-memory state. Note that although each vat keeps its own counter
tracking when it should next be snapshotted, the frequency itself is global to
the entire swingset. Defaults to 200.

The `snapshotInitial` property is a special snapshot interval that applies only
to the vat's very first snapshot. We treat it as a special case because a few
of the very first cranks of a vat (which involve initialization) can be quite
expensive, and we'd like to be able to promptly capture the benefit having paid
that expense so that future replays don't need to repeat the work. Defaults to 2.

The code that realizes a vat or device can be specified in one of five
ways:

- `sourceSpec`, the path to the module or file containing the root
  object definition;

- `bundleSpec`, the path to a file or module containing a
  pre-generated bundle such as is currently generated by the vat
  controller from paths of the first kind;

- `bundleHash`, a hashstring that can be used as a retrieval key to
  fetch a bundle from a content-addressed repository of some kind
  (without, at this point, saying anything about the nature, location,
  or API of such a repository);

- `bundleName`, a simple name string that can be used to designate a
  bundle by referring to the a vat, device, or bundle described by some
  other `vats`, `devices`, or `bundles` entry; or

- `bundle`, a prebundled source string.

These five alternatives are mutually exclusive, but one of them must be provided
for each vat or device.

`parameters` is a data object (defaults to the empty object if omitted) that is
passed to the vat or device as one of its creation parameters as the second
argument to the `buildRootObject` function. The second argument to
`buildVatController` or `initializeSwingset` is an array of strings, nominally
representing command line parameters such as would be given when launching a
statically defined vat group via a command line tool such as `swingset-runner`
or `ag-solo`. If such command line parameters are given to one of the vat
initiation functions, they are added to the bootstrap vat's `parameters` object
as the property `argv`.

`endowments` is a data object that is interpreted by the vat creation
mechanism to describe the endowments of the vat or device _(yes, more
description is needed here)_, which are passed to the vat in the
`vatPowers` parameters to its `buildRootObject` method. NOTE: this is
not yet supported.

`creationOptions` are directives to the vat controller rather than to the vat itself:

- `enablePipelining` specifies whether the vat should be launched with
  promise pipelining enabled. Defaults to `false`.

- `name` is an optional short label string used to identify the vat in log and
  debug outputs. If omitted, it defaults to the property name that was used for
  the vat descriptor.

- `enableDisavow`, if `true`, adds `vatPowers.disavow()`, which allows vat code
  to explicitly disavow interest in an imported Presence. This will trigger a
  `syscall.dropImports` of the associated object ID. By default, this
  function is not added to `vatPowers`.

- `managerType` indicates what sort of vat worker to run the associated vat in.
  If omitted, it defaults to the swingset's default manager type.

- `metered` specifies whether the vat should be have metering turned
  on or not. Defaults to `false`.

- `reapInterval` specifies the reap interval for this particular vat. It
  defaults to the swingset's default reap interval.

- `enableSetup` indicates that the vat module may use the older, lower
  level `setup()` API, which allows a vat to be defined independent of
  the liveslots framework (defaults to `false` if omitted). (If you
  don't understand what this means, do not use this.)

- `critical`, if `true`, marks the vat as critical to the correct functioning of
  the swingset. If a critical vat suffers a failure, the kernel will panic and
  the swingset as a whole will be terminated without saving any intermediate
  state that resulted during the crank that caused the vat to die. Defaults to
  `false`.

- `useTranscript`, if `true`, says the vat should record a transcript of all
  deliveries made to it so that these can be replayed at a later time to
  reconstruct the internal state of the vat. Defaults to `true`.

- `virtualObjectCacheSize` tells the vat's virtual object manager how many
  virtual objects should have their state kept live in memory at any given
  time. Defaults to an implementation defined value.

## Dynamic option setting

Some swingset and vat configuration options can be dynamically updated within a
running swingset.

### Dynamic kernel options

Swingset-wide (kernel) options are updated by calling the
`changeKernelOptions(options)` method on the swingset's controller object, where
`options` is an object indicating which options to change and the values to
change them to.

Currently supported kernel options that you can change this way are:

- `defaultReapInterval`

- `snapshotInterval`

`controller.changeKernelOptions` should be called when the kernel is idle, i.e.,
not in the middle of a `controller.run()`. Modifying options will cause state
changes to be written to the block buffer (i.e., the `hostStorage` object
provided to `buildVatController`), and the host application is solely
responsible for committing those changes to persistent storage, so most
applications will need to do a `commit()` some time after call
`controller.changeKernelOptions`.

### Dynamic vat options

The options for a single vat may be updated by sending the
`changeOptions(options)` message to the vat's admin node. For example, if the
admin node is referenced in a variable named `adminFacet`, the you would say
`E(adminFacet).changeOptions(options)`. Note that because the admin node is
involved, dynamic options update is not available for statically configured
vats, i.e., vats configured using the config object described above).

Currently supported vat options that you can change this way are:

- `virtualObjectCacheSize`

- `reapInterval`

Other options may be added in the future.
