// An atomic update implementation backported from Polymer 2.
//
// see https://github.com/Polymer/polymer/issues/3640
// see https://github.com/Polymer/polymer/pull/3641
export const setProperties = (element, propsObj) => {
  for (const prop in propsObj) {
    element._propertySetter(prop, propsObj[prop]);
  }

  for (const prop in propsObj) {
    const value = propsObj[prop];

    element._pathEffector(prop, value);
    element._notifyPathUp(prop, value);
  }
}
