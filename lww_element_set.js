import { isInteger } from 'lodash'
import { InvalidArgumentException } from './errors'

/**
 * last-write-wins element set
 */
export class LwwElementSet {
  static BIAS = Object.freeze( {
    BIAS_ADD: -1,
    BIAS_REMOVAL: 0,
  } )

  /**
   * creates a set and initializes payload as empty set
   */
  constructor( bias=LwwElementSet.BIAS.BIAS_ADD ) {
    this.aset = {}
    this.rset = {}
    this.bias = bias
  }

  /**
   * adds object in payload
   * @param {*} x - object to be added
   * @throws {InvalidArgumentException} time should be a positive integer
   */
  add( x, time ) {
    if( ! isInteger( time ) ) {
      throw new InvalidArgumentException( 'argument should be an integer' )
    }
    if( time <= 0 ) {
      throw new InvalidArgumentException( 'argument should be positive' )
    }
    this.aset[ x ] = Math.max( x in this.aset ? this.aset[ x ] : -1, time )
  }

  /**
   * marks object as removed in payload
   * @param {*} x - object to be marked as removed
   * @throws {InvalidArgumentException} time should be a positive integer
   */
  remove( x, time ) {
    if( ! isInteger( time ) ) {
      throw new InvalidArgumentException( 'argument should be an integer' )
    }
    if( time <= 0 ) {
      throw new InvalidArgumentException( 'argument should be positive' )
    }
    this.rset[ x ] = Math.max( x in this.rset ? this.rset[ x ] : -1, time )
  }

  /**
   * checks presence of queried object
   * @param {*} x - queried object
   * @return {boolean}
   */
  lookup( x ) {
    // x is in payload **AND**
    return x in this.aset &&
    // x is not marked as removed **OR** x is newer
      ( ! ( x in this.rset ) || this.aset[ x ] > this.rset[ x ] + this.bias )
  }

  /**
   * checks whether payload of current set is subset of that of the other
   * @param {LwwElementSet} x - the set to be checked against
   * @throws {InvalidArgumentException} x should be a LWW element set
   */
  compare( x ) {
    if( ! ( x instanceof LwwElementSet ) ) {
      throw new InvalidArgumentException( 'argument should be a LWW element set' )
    }
    // all elements in current set should be in the other
    for( let i of Object.keys( this.aset ) ) {
      if( this.lookup( i ) && ! x.lookup( i ) ) {
        // or otherwise, fail
        return false
      }
    }
    return true
  }

  /**
   * puts union of two sets into the first set
   * @param {LwwElementSet} set1 - the set merging the other
   * @param {LwwElementSet} set2 - the set to be merged
   */
  static merge_set( set1, set2 ) {
    for( let x of Object.keys( set2 ) ) {
      // x is not in set1 **OR** x in set2 is newer
      if( ! ( x in set1 ) || set1[ x ] < set2[ x ] ) {
        set1[ x ] = set2[ x ]
      }
    }
  }

  /**
   * merges and updates payload value from the other set
   * @param {LwwElementSet} x - the set to be merged
   * @return {LwwElementSet}
   * @throws {InvalidArgumentException} x should be a LWW element set
   */
  merge( x ) {
    if( ! ( x instanceof LwwElementSet ) ) {
      throw new InvalidArgumentException( 'argument should be a LWW element set' )
    }
    LwwElementSet.merge_set( this.aset, x.aset )
    LwwElementSet.merge_set( this.rset, x.rset )
    return this
  }

  /**
   * creates a set and initializes its payload as specified
   * @param {number[]} aset - initial payload to be stored in set created
   * @param {number[]} set - initial payload to be stored in set created and is marked as removed
   */
  static create( aset, rset, bias=LwwElementSet.BIAS.BIAS_ADD ) {
    const set = new LwwElementSet( bias )
    set.aset = Object.assign( {}, aset )
    set.rset = Object.assign( {}, rset )
    return set
  }
}

