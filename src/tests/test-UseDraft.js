import React, {Component} from 'react';
import {mount, shallow} from 'enzyme';
import {expect} from 'chai';
import sinon from 'sinon';
import {useDraft} from '../Draft';

   
const testData = {
   idNum: 1,
   name: "John Doe",
   company: "Place",
   phone: "777-7777"
};

describe('useDraft', () => {
   const stateFuncs = [
      'get',
      'set',
      'state',
      'check',
      'update',
      'clear',
      'changed'
   ];
   var wrapper;
   function HookTester(){
      var {
         state,
         set,
         get,
         update,
         clear,
         changed
       } = useDraft(testData);
      return  <div>{
         Object.keys(state)
         .map(k =>
            k ? <input
               key={k}
               value={state[k].toString()}
               className={k}
               onChange={e => set(k, e.target.value)}
            /> : null
         )
      }</div>
   }
   beforeEach(() => {
      wrapper = mount(<HookTester/>);
   })
   it(`returns a state with the initial state passed as original`, () => {
      for (let k in testData){
         expect(
            wrapper.find(`.${k}`).prop('value')
         ).to.equal(testData[k].toString())
      }
   })
   it(`correctly passes new value to child through props.state`, () => {
      const newValue = "new";

      for (let k in testData){
         wrapper
            .find(`.${k}`)
            .simulate('change', {
               target: {value: newValue}
            })

         expect(
            wrapper.find(`.${k}`).prop('value')
         ).to.equal(newValue)
      }
   })
      
})
