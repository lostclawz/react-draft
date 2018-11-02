# react-draft
a react higher order component to manage a component's draft state

## Setup

*  `npm install` to install dependencies
*  `npm test` to run mocha tests


## Usage
Draft accepts one property, `original`: a single object which is the original state of your data.
Draft then works as a [render prop](https://reactjs.org/docs/render-props.html) component, meaning it must have a single function as a child. This function is passed one argument, an object containing a set of functions used to manage your draft data state. For example:

      import Draft from './react-draft/src/Draft'`;

      export const Wrapper = props =>
         <div className="page">
            <Draft original={props.data}>{
               ({
                  get,
                  set,
                  state,
                  check,
                  update,
                  clear,
                  changed
               }) => (
                  <FormEditor
                     state={state}
                     onChange={onChange}
                     checkForChanges={check}
                  />
               )
            }</Draft>
         </div>


## Available Argument Properties

The object passed as an argument includes:
   
### `get(prop, defaultValue)`
retrieves the value of a property by name. Using `get` returns the same value as its corresponding key in the state: `get('name') === state.name`. `get` can also except a second argument for a default value, if none exists.
### `set(prop, value)` or `set(object)`
update the value of prop. Set can also be passed an object, like `this.setState`.
### `onChange(key)(value)`
a convenience function to curry the key of the object:

      <input
         value={state.value}
         onChange={
            this.props.onChange('firstName')
         }
      />`

### `state`
The current state of your data, which is your initial original object merged with any changes you've made.
### `check()`
Returns a boolean indicating whether your state has changed since original. 
### `update(updateObj)`
updates the state using an [immutability-helper](https://github.com/kolodny/immutability-helper) object, ie: `update({name: {$set: "New Name"}})`
### `clear()`
clears any changes made. After calling this function `changed` will be an empty object, check() will return false, and state will deep equal `original`.
### `changed`
An object which has a key for each property changed. The value of each key is another object with an `original` property and `edited`.

## Special Case Comparisons

Generally it is recommended to keep your data string serializable to prevent false positives.
Draft makes assumptions that could affect your application.

*  a `false` edited state is seen as equal to `undefined` in the original state. If you are using your checkboxes or toggles to control your state, generally the "off" state is the same as undefined, so if the property didn't exist in your original state, and it's false in your edited state, Draft assumes that **no change has been made**. This can be turned off if you set the `stringifyCompare` property on Draft to `false`. 