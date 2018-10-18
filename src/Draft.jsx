import React, {
   PureComponent,
   createContext
} from 'react';
import update from 'immutability-helper';
import isEqualWith from 'lodash/isEqualWith';
import PropTypes from 'prop-types';


const stringify = it => {
   // objects and arrays = JSON
   if (typeof it === 'object'){
      return JSON.stringify(it);
   }
   // undefined = ''
   if (typeof it === 'undefined'){
      return '';
   }
   // NaN, null, etc...
   return `${it}`;
}

const compareValues = (a, b, strict=false) => {
   if (strict){
      return a === b;
   }
   else{
      if (a == undefined){
         // special case where a isn't set (therefore false)
         // and b is false (entered by user)
         if (typeof b === 'boolean' || typeof b === 'string'){
            if (b.toString() == 'false'){
               return true;
            }
         }
      }
      return stringify(a) === stringify(b);
   }
}

const DraftContext = createContext('draft-context')

const DraftConsumer = DraftContext.Consumer;


class Draft extends PureComponent{
   static propTypes = {
      original: PropTypes.object,
      children: PropTypes.func
   }
   render(){
      let {
         original,
         children
      } = this.props;
      return typeof children === 'function'
         ? (
            <DraftProvider original={original}>
               <DraftConsumer>{
                  props => children(props)
               }</DraftConsumer>
            </DraftProvider>
         ) : children;
   }
}

const DraftDecorator = adapter => WrappedComponent => props => 
   <DraftConsumer>{ draftProps => 
      <WrappedComponent
         {...adapter(draftProps)}
         {...props}
      />
   }</DraftConsumer>

      

class DraftProvider extends PureComponent{
   
   static propTypes = {
      stringifyCompare: PropTypes.bool
   }

   static defaultProps = {
      stringifyCompare: true
   }

   constructor(props){
      super(props);
      this.state = {};
   }

   /**
    * gets a value by key
    */
   get = (key, defaultValue) => {
      let {original} = this.props;
      if (this.state[key] === undefined){
         if (original[key] !== undefined){
            return original[key];
         }
         else{
            if (defaultValue !== undefined){
               return defaultValue;
            }
         }
      }
      return this.state[key];
   }

   /**
    * sets value by key and value
    */
   set = (key, value) =>
      this.setState(
         typeof key === 'object'
         ? key
         : {[key]: value}
      )

   /**
    * Use immutability helper's update
    * syntax to update the state
    */
   update = updateObj =>
      this.setState(
         update(this.state, updateObj)
      )
   
   equalValues = (a, b) => {
      let {stringifyCompare} = this.props;
      return compareValues(a, b, !stringifyCompare)
   }
   
   /**
    * returns an object with state of data
    * and an array of object keys that have been edited
    */
   getState = () => {
      let {original} = this.props;
      let edits = {...original};
      let keysChanged = {};
      for (let k in this.state){
         if (this.state[k] !== undefined){
            if (!this.equalValues(original[k], this.state[k])){
               keysChanged[k] = {
                  original: original[k],
                  edited: this.state[k]
               };
            }
            edits[k] = this.state[k];
         }
      }
      return {
         changed: keysChanged,
         state: edits
      };  
   }

   /**
    * clear changes from state
    */
   clear = () => {
      throw new Error("test");
      let update = {};
      for (let k in this.state){
         update[k] = undefined;
      }
      this.setState(update);
      return update;
   }

   /**
    * Returns true to indicate
    * changes have been made
    */
   check = () =>
      isEqualWith(
         this.props.original,
         this.getState().state,
         this.equalValues
      ) ? false : true

   render(){
      let {
         props: {
            children
         },
         get,
         set,
         update,
         clear,
         check,
         getState,
      } = this;
      let {
         changed,
         state
      } = getState();

      return (
         <DraftContext.Provider
            value={{
               get,
               set,
               update,
               clear,
               check,
               state,
               changed
            }}
            children={children}
         />
      )
   }
}

export {
   DraftProvider,
   DraftContext,
   DraftConsumer,
   Draft,
   stringify,
   compareValues,
   DraftDecorator
}
export default Draft;