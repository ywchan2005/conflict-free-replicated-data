import { isInteger } from 'lodash'
import { InvalidArgumentException, InvalidLengthException } from './errors'

/**
 * grow-only counter
 */
export class GrowOnlyCounter {
  /**
   * creates a counter and initializes all slots to be 0
   * @param {number} n - number of slots to be allocated
   * @throws {InvalidArgumentException} n should be a positive integer
   */
  constructor( n ) {
    if( ! isInteger( n ) ) {
      throw new InvalidArgumentException( 'argument should be an integer' )
    }
    if( n <= 0 ) {
      throw new InvalidArgumentException( 'argument should be positive' )
    }
    this.payload = Array( n ).fill( 0 )
  }

  /**
   * increments indexed slot by one
   * @param {number} idx - index of slot to be incremented
   * @throws {InvalidArgumentException} n should be an integer and lies within length of counter
   */
  increment( idx ) {
    if( ! isInteger( idx ) ) {
      throw new InvalidArgumentException( 'argument should be an integer' )
    }
    if( idx < 0 ) {
      throw new InvalidArgumentException( 'index should be non-negative' )
    }
    if( idx >= this.payload.length ) {
      throw new InvalidArgumentException( `index should not exceed length of counter, [0..${this.payload.length}]` )
    }
    this.payload[ idx ] += 1
  }

  /**
   * calculates and returns payload value
   * @return {number}
   */
  value() {
    return this.payload.reduce( ( acc, x ) => acc + x )
  }

  /**
   * checks whether payload value of current counter is less than or equal to that of the other
   * @param {GrowOnlyCounter} x - the counter to be checked against
   * @throws {InvalidArgumentException} x should be a grow-only counter
   * @throws {InvalidLengthException} length of two counters should match
   */
  compare( x ) {
    if( ! ( x instanceof GrowOnlyCounter ) ) {
      throw new InvalidArgumentException( 'argument should be a grow-only counter' )
    }
    if( this.payload.length != x.payload.length ) {
      throw new InvalidLengthException( 'length of two counters do not match' )
    }
    // all slots of current counter should be less than or equal to those of the other
    for( let i = 0; i < this.payload.length; i++ ) {
      if( this.payload[ i ] > x.payload[ i ] ) {
        // or otherwise, fail
        return false
      }
    }
    return true
  }

  /**
   * merges and updates payload value from the other counter
   * @param {GrowOnlyCounter} x - the counter to be merged
   * @return {GrowOnlyCounter} current counter itself
   * @throws {InvalidArgumentException} x should be a grow-only counter
   * @throws {InvalidLengthException} length of two counters should match
   */
  merge( x ) {
    if( ! ( x instanceof GrowOnlyCounter ) ) {
      throw new InvalidArgumentException( 'argument should be a grow-only counter' )
    }
    if( this.payload.length != x.payload.length ) {
      throw new InvalidLengthException( 'length of two counters do not match' )
    }
    for( let i = 0; i < this.payload.length; i++ ) {
      this.payload[ i ] = Math.max( this.payload[ i ], x.payload[ i ] )
    }
    return this
  }

  /**
   * creates a counter and initializes its payload as specified
   * @param {number[]} payoad - initial payload to be stored in counter created
   */
  static create( payload ) {
    const counter = new GrowOnlyCounter( payload.length )
    for( let i = 0; i < payload.length; i++ ) {
      counter.payload[ i ] = payload[ i ]
    }
    return counter
  }
}

