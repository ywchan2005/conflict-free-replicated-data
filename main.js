import { GrowOnlyCounter } from './grow_only_counter'
import { LwwElementSet } from './lww_element_set'

const counter1 = GrowOnlyCounter.create( [ 1, 2, 3 ] )
const counter2 = GrowOnlyCounter.create( [ 3, 2, 1 ] )
console.debug( 'counter1:', counter1 )
console.debug( 'counter2:', counter2 )
console.debug( 'merge:', counter1.merge( counter2 ) )

const set1 = LwwElementSet.create( { 'a': 1 }, {} )
const set2 = LwwElementSet.create( { 'b': 1 }, { 'a': 2 } )
console.debug( 'set1:', set1 )
console.debug( 'set2:', set2 )
console.debug( 'merge:', set1.merge( set2 ) )

