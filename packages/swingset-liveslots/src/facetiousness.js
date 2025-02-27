import { Fail } from '@endo/errors';

/**
 * Assess the facetiousness of a value.  If the value is an object containing
 * only named properties and each such property's value is a function, `obj`
 * represents a single facet and 'one' is returned.  If each property's value
 * is instead an object of facetiousness 'one', `obj` represents multiple
 * facets and 'many' is returned.  In all other cases `obj` does not represent
 * any kind of facet abstraction and 'not' is returned.
 *
 * @typedef {'one'|'many'|'not'} Facetiousness
 *
 * @param {*} obj  The (alleged) object to be assessed
 * @returns {Facetiousness} an assessment of the facetiousness of `obj`
 */
export function assessFacetiousness(obj) {
  if (typeof obj !== 'object') {
    return 'not';
  }
  let result;
  for (const prop of Reflect.ownKeys(obj)) {
    const value = obj[prop];
    let resultFromProp;
    if (typeof value === 'function') {
      resultFromProp = 'one';
    } else if (assessFacetiousness(value) === 'one') {
      resultFromProp = 'many';
    } else {
      return 'not';
    }
    if (!result) {
      // capture the result of inspecting the first property
      result = resultFromProp;
    } else if (resultFromProp !== result) {
      // and bail out upon encountering any deviation
      return 'not';
    }
  }
  // empty objects are methodless Far objects
  return /** @type {Facetiousness} */ (result || 'one');
}

// note: mutates 'desc' in-place
export const checkAndUpdateFacetiousness = (tag, desc, proposedFacetNames) => {
  // The first time a durable kind gets a definition, the saved
  // descriptor will have neither ".unfaceted" nor ".facets", and we
  // must update the details in the descriptor. When a later
  // incarnation redefines the behavior, we must check for
  // compatibility (all old facets must still be defined). We
  // re-assign .facets/.unfaceted each time, even if we're not
  // changing anything.

  if (desc.unfaceted && proposedFacetNames) {
    Fail`defineDurableKindMulti called for unfaceted KindHandle ${tag}`;
  }
  if (desc.facets && !proposedFacetNames) {
    Fail`defineDurableKind called for faceted KindHandle ${tag}`;
  }
  let newFacetNames;
  if (proposedFacetNames) {
    const oldFacetNames = desc.facets ? [...desc.facets] : [];
    const proposal = [...proposedFacetNames];
    newFacetNames = [];
    // all old facets must be present in the proposal
    for (const facet of oldFacetNames) {
      const proposedIdx = proposal.indexOf(facet);
      if (proposedIdx === -1) {
        const orig = oldFacetNames.join(',');
        const newer = proposedFacetNames.join(',');
        Fail`durable kind "${tag}" facets (${newer}) is missing ${facet} from original definition (${orig})`;
      }
      proposal.splice(proposedIdx, 1); // remove from proposal
      newFacetNames.push(facet);
    }

    // new facets are appended in alphabetic order
    proposal.sort();
    desc.facets = newFacetNames.concat(proposal);
  } else {
    desc.unfaceted = true;
  }
  return desc.facets; // 'undefined' for unfaceted
  // caller will saveDurableKindDescriptor()
};
