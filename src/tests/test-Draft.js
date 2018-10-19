import React from 'react';
import {mount} from 'enzyme';
import {expect} from 'chai';
import Draft, {compareValues} from '../Draft';


const Tester = ({
   onChange,
   checkIfEdited,
   getProp,
   clear,
   updateState,
   changed,
   state,
   ...props
}) =>
   Object.keys(props)
   .map(k =>
      k ? <input
         key={k}
         value={props[k].toString()}
         className={k}
         onChange={e =>
            onChange(k, e.target.value)
         }
      /> : null
   )


describe('<Draft/>', () => {
	
	let wrapper;
   
	const testData = {
      idNum: 1,
      name: "John Doe",
      company: "Place",
      phone: "777-7777"
   };

	beforeEach(() => {
		wrapper = mount(
			<Draft
            original={testData}
         >{({
            get,
            set,
            state,
            check,
            update,
            clear,
            changed
         }) => 
            <Tester
               onChange={set}
               checkIfEdited={check}
               getProp={get}
               updateState={update}
               state={state}
               changed={changed}
               onClear={clear}
               {...state}
            />
         }</Draft>
      );
   })
   
   it(`initially passes original prop to children as state prop`, () => {
      const TesterEl = wrapper.find(Tester);
      for (var k in testData){
         expect(TesterEl.props()[k])
            .to.equal(testData[k])
      }
   })

   describe(`compareValues(original, edited, false)`, () => {
      const compareTests = [
         {a: undefined, b: '', expected: true},
         {a: undefined, b: false, expected: true},
         {a: '', b: undefined, expected: true},
         {a: '', b: '', expected: true},
         {a: NaN, b: NaN, expected: true},
         {a: 1, b: "1", expected: true},
         {a: false, b: "false", expected: true},
         {a: false, b: "true", expected: false},
         {a: "true", b: true, expected: true},
         {a: true, b: "true", expected: true},
         {a: NaN, b: undefined, expected: false}
      ];
      compareTests.forEach(({a, b, expected}) =>
         it(`returns ${expected} for "${a}" == "${b}"`, () => {
            expect(compareValues(a, b, false)).to.equal(expected);
         })
      )
      it(`returns false if original value is undefined and edited value isn't undefined`, () => {
         expect(compareValues(undefined, "test")).to.equal(false);
         expect(compareValues(undefined, undefined)).to.equal(true);
      })
   })
   describe(`compareValues(original, edited, true)`, () => {
      const compareTests = [
         {a: undefined, b: '', expected: false},
         {a: '', b: undefined, expected: false},
         {a: '', b: '', expected: true},
         {a: NaN, b: NaN, expected: false},
         {a: 1, b: "1", expected: false},
         {a: false, b: "false", expected: false},
         {a: true, b: "true", expected: false},
         {a: NaN, b: undefined, expected: false}
      ];
      compareTests.forEach(({a, b, expected}) =>
         it(`returns ${expected} for "${a}" == "${b}"`, () => {
            expect(compareValues(a, b, true)).to.equal(expected);
         })
      )
   })

   describe(`props.set(key, value)`, () => {
      it(`correctly passes new value to child through props.state`, () => {
         const newValue = "new";

         for (let k in testData){
            wrapper
               .find(`.${k}`)
               .simulate('change', {
                  target: {value: newValue}
               })

            expect(
               wrapper.find(Tester)
               .props()[k]
            ).to.equal(newValue)
         }
      })
      it(`accepts an object instead of string as first argument, updating like setState`, () => {
         const multiChange = {
            company: "Another",
            phone: "666-6666"
         };
         const merged = {
            ...testData,
            ...multiChange
         }
         wrapper.find(Tester).props().onChange(multiChange);
         for (let k in merged){
            let val = merged[k];
            expect(
               wrapper.find(Tester).props().getProp(k)
            ).to.equal(val);
         }
      })
   })

   describe(`props.clear()`, () => {
      let funcs;
      before(() => {
         wrapper = mount(
            <Draft original={testData}>{
               props => {
                  funcs = props;
                  return null;
               }
            }</Draft>
         );
      })
      it(`passes a clear() function to children`, () => {
         expect(funcs.clear).to.be.a('function');
      })
      it(`removes any edits made`, () => {
         expect(funcs.state).to.deep.equal(testData);
         funcs.set('name', 'Test');
         expect(funcs.state.name).to.equal('Test');
         funcs.clear();
         expect(funcs.state.name).to.equal(testData.name);
         expect(funcs.changed).to.be.empty;
      })
      it(`after being called check() returns false`, () => {
         expect(funcs.state).to.deep.equal(testData);
         funcs.set('name', 'Test');
         expect(funcs.check()).to.be.true;
         expect(funcs.state.name).to.equal('Test');
         funcs.clear();
         expect(funcs.check()).to.be.false;
      })
   })

   describe(`props.get(key, defaultValue)`, () => {
      it(`returns the correct value from state`, () => {
         expect(
            wrapper.find(Tester).props().getProp('name')
         ).to.equal(testData.name);
      })
      it(`returns defaultValue if provided and value doesn't exist in state or original`, () => {
         expect(
            wrapper.find(Tester).prop('getProp')('whatever', 'exists')
         ).to.equal('exists');
         wrapper.find(Tester).prop('onChange')('whatever', 'true');
         expect(
            wrapper.find(Tester).prop('getProp')('whatever', 'exists')
         ).to.equal('true');
      })
   })

   describe(`props.update($updateObj)`, () => {
      it(`accepts an immutability helper update object to alter state`, () => {
         wrapper.find(Tester).props().updateState({'name': {$set: "Test"}});
         expect(
            wrapper.find(Tester).props().getProp('name')
         ).to.equal("Test");
      })
   })

   describe(`props.check()`, () => {
      it(`returns false if no edits have been made`, () => {
         expect(
            wrapper.find(Tester).props().checkIfEdited()
         ).to.equal(false);
      })
      it(`returns true if an edit was made`, () => {
         expect(
            wrapper.find(Tester).props().checkIfEdited()
         ).to.equal(false);
         
         wrapper
            .find(`.name`)
            .simulate('change', {
               target: {value: ""}
            })
         expect(
            wrapper.find(Tester).props().checkIfEdited()
         ).to.equal(true);
      })
      it(`returns false if an edit was made that is equal to what was in the original`, () => {
         wrapper
            .find(`.name`)
            .simulate('change', {
               target: {value: testData.name}
            })
         expect(
            wrapper.find(Tester).props().checkIfEdited()
         ).to.equal(false);
      })
   })

   describe(`props.changed`, () => {
      it(`is an object`, () => {
         expect(
            wrapper.find(Tester).prop('changed')
         ).to.be.an('object');
      })
      it(`is initially empty`, () => {
         expect(
            wrapper.find(Tester).prop('changed')
         ).to.be.empty;
      })
      it(`after a change is made, contains an object with original and edited value`, () => {
         let changedName = "Johnny Doe";
         expect(
            wrapper.find(Tester).prop('changed')
         ).to.be.empty;
         wrapper.find('.name').simulate('change', {
            target: {value: changedName}
         });
         expect(
            wrapper.find('.name').prop('value')
         ).to.equal(changedName);
         expect(
            wrapper.find(Tester).prop('name')
         ).to.equal(changedName);
         expect(
            wrapper.find(Tester).prop('changed')
         ).to.have.key('name');
         let changed = wrapper.find(Tester).prop('changed');
         expect(changed).to.have.key('name');
         expect(changed.name).to.be.an('object');
         expect(changed.name.original).to.equal(testData.name);
         expect(changed.name.edited).to.equal(changedName);
      })
      it(`doesn't include property name if the change equals original`, () => {
         let changedName = "Johnny Doe";
         let changeBack = testData.name;

         expect(
            wrapper.find(Tester).prop('changed')
         ).to.be.empty;
         // change to something different
         wrapper.find('.name').simulate('change', {
            target: {value: changedName}
         });
         expect(
            wrapper.find('.name').prop('value')
         ).to.equal(changedName);
         
         let changed = wrapper.find(Tester).prop('changed');
         expect(changed).to.be.not.empty;
         expect(changed).to.have.key('name');
         // back to original value
         wrapper.find('.name').simulate('change', {
            target: {value: changeBack}
         });
         expect(
            wrapper.find('.name').prop('value')
         ).to.equal(changeBack);
         expect(
            wrapper.find(Tester).prop('changed'),
            "still includes edit when change is equal to original"
         ).to.be.empty;
         
      })
   })
	
})