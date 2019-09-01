import { InvalidArgumentException } from './errors'

/**
 * grow-only set
 */
export class GrowOnlySet {
  /**
   * creates a set and initializes payload as empty set
   */
  constructor() {
    this.payload = new Set()
  }

  /**
   * adds object in payload
   * @param {*} x - object to be added
   */
  add( x ) {
    this.payload.add( x )
  }

  /**
   * checks presence of queried object
   * @param {*} x - queried object
   * @return {boolean}
   */
  lookup( x ) {
    return this.payload.has( x )
  }

  /**
   * checks whether payload of current set is subset of that of the other
   * @param {GrowOnlySet} x - the set to be checked against
   * @throws {GrowOnlySet} x should be a grow-only set
   */
  compare( x ) {
    if( ! ( x instanceof GrowOnlySet ) ) {
      throw new InvalidArgumentException( 'argument should be a grow-only set' )
    }
    // all elements in current set should be in the other
    for( let i of this.payload ) {
      if( ! x.lookup( i ) ) {
        // or otherwise, fail
        return false
      }
    }
    return true
  }

  /**
   * merges and updates payload value from the other set
   * @param {GrowOnlySet} x - the set to be merged
   * @return {GrowOnlySet} current set itself
   * @throws {GrowOnlySet} x should be a grow-only set
   */
  merge( x ) {
    if( ! ( x instanceof GrowOnlySet ) ) {
      throw new InvalidArgumentException( 'argument should be a grow-only set' )
    }
    this.payload = new Set( [ ...this.payload, ...x.payload ] )
    return this
  }

  /**
   * creates a set and initializes its payload as specified
   * @param {number[]} payoad - initial payload to be stored in set created
   */
  static create( payload ) {
    const set = new GrowOnlySet()
    set.payload = new Set( payload )
    return set
  }
}

