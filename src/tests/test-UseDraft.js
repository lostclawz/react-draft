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

function HookTester({data}){
   var {
      state,
      set,
      get,
      update,
      clear,
      check,
      changed
   } = useDraft(data);
   return  <div>
      <form>{
      Object.keys(state)
      .map(k =>
         k ? <input
            key={k}
            value={state[k].toString()}
            className={k}
            onChange={e => set(k, e.target.value)}
         /> : null
      )
      }</form>
      {check() ? (
         <button
            className="revert"
            onClick={clear}
            children="revert"
         />
      ) : false}
   </div>
}

describe('useDraft', () => {

   var wrapper;

   beforeEach(() => {
      wrapper = mount(<HookTester data={testData}/>);
   })

   it(`returns a state with the initial state passed as original`, () => {
      for (let k in testData){
         expect(
            wrapper.find(`.${k}`).prop('value')
         ).to.equal(testData[k].toString())
      }
   })
   it(`correctly passes state to component`, () => {
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
   it(`handles check() and clear() functions`, () => {
      // no .revert before changes
      expect(wrapper.find('.revert')).to.have.lengthOf(0);
      wrapper.find('.name').simulate('change', {
         target: {value: "new name"}
      });
      expect(wrapper.find('.name').prop('value')).to.equal("new name");
      // .revert button after changes
      expect(wrapper.find('.revert')).to.have.lengthOf(1);
      // click revert button to trigger clear()
      wrapper.find('.revert').simulate('click')
      expect(wrapper.find('.revert')).to.have.lengthOf(0);
   })
      
})
