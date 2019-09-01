import { LwwElementSet } from '../lww_element_set'
import { InvalidArgumentException } from '../errors'

describe( 'LwwElementSet', () => {

  // one factor
  // 1. whether the created set is biased towards addition or removal
  it( 'allocates an empty set', () => {
    const set = new LwwElementSet()
    expect( Object.keys( set.aset ).length ).toEqual( 0 )
    expect( Object.keys( set.rset ).length ).toEqual( 0 )
    expect( set.bias ).toEqual( LwwElementSet.BIAS.BIAS_ADD )
  } )

  it( 'allocates an empty set with a removal bias', () => {
    const set = new LwwElementSet( LwwElementSet.BIAS.BIAS_REMOVAL )
    expect( Object.keys( set.aset ).length ).toEqual( 0 )
    expect( Object.keys( set.rset ).length ).toEqual( 0 )
    expect( set.bias ).toEqual( LwwElementSet.BIAS.BIAS_REMOVAL )
  } )

  // three goals to achieve
  // 1. commutative
  // 2. associative
  // 3. idempotent
  describe( 'merge()', () => {

    // checks if it is commutative such that the following holds
    //   merge( c1, c2 ) == merge( c2, c1 )
    it( 'is commutative', () => {
      const set1 = new LwwElementSet()
      const set2 = new LwwElementSet()
      const [ c1, c2 ] = [ { 'a': 1 }, { 'b': 2 } ]
      const [ c3, c4 ] = [ { 'c': 3 }, { 'd': 4 } ]
      set1
        .merge( LwwElementSet.create( c1, c3 ) )
        .merge( LwwElementSet.create( c2, c4 ) )
      set2
        .merge( LwwElementSet.create( c2, c4 ) )
        .merge( LwwElementSet.create( c1, c3 ) )
      expect( set1.aset ).toEqual( { 'a': 1, 'b': 2 } )
      expect( set2.aset ).toEqual( { 'a': 1, 'b': 2 } )
      expect( set1.rset ).toEqual( { 'c': 3, 'd': 4 } )
      expect( set2.rset ).toEqual( { 'c': 3, 'd': 4 } )
    } )

    // checks if it is associative such that the following holds
    //   merge( c1, merge( c2, c3 ) ) == merge( merge( c1, c2 ), c3 )
    it( 'shuold be associative', () => {
      const set1 = new LwwElementSet()
      const set2 = new LwwElementSet()
      const [ c1, c2, c3 ] = [ { 'a': 1 }, { 'b': 2 }, { 'c': 3 } ]
      const [ c4, c5, c6 ] = [ { 'd': 4 }, { 'e': 5 }, { 'f': 6 } ]
      set1
        .merge( LwwElementSet.create( c1, c4 ) )
        .merge( LwwElementSet.create( c2, c5 )
          .merge( LwwElementSet.create( c3, c6 ) ) )
      set2
        .merge( LwwElementSet.create( c1, c4 )
          .merge( LwwElementSet.create( c2, c5 ) ) )
        .merge( LwwElementSet.create( c3, c6 ) )
      expect( set1.aset ).toEqual( { 'a': 1, 'b': 2, 'c': 3 } )
      expect( set2.aset ).toEqual( { 'a': 1, 'b': 2, 'c': 3 } )
      expect( set1.rset ).toEqual( { 'd': 4, 'e': 5, 'f': 6 } )
      expect( set2.rset ).toEqual( { 'd': 4, 'e': 5, 'f': 6 } )
    } )

    // checks if it is idempotent such that the following holds
    //   merge( c1, merge( c1 ) ) == merge( c1 )
    it( 'is idempotent', () => {
      const set1 = new LwwElementSet()
      const set2 = new LwwElementSet()
      const c1 = { 'a': 1, 'b': 2 }
      const c2 = { 'c': 3, 'd': 4 }
      set1
        .merge( LwwElementSet.create( c1, c2 ) )
        .merge( LwwElementSet.create( c1, c2 ) )
      set2
        .merge( LwwElementSet.create( c1, c2 ) )
      expect( set1.aset ).toEqual( set2.aset )
      expect( set1.rset ).toEqual( set2.rset )
    } )

    // checks validity of argument
    for( let x of [ 0, null, NaN, '', [], {} ] ) {
      it( `throws exception when argument is invalid (${JSON.stringify( x )})`, () => {
        const set = LwwElementSet.create( [ 1 ] )
        expect( () => {
          set.merge( x )
        } ).toThrow( InvalidArgumentException )
      } )
    }

  } )

  // two factors
  // 1. whether object is in the set
  // 2. whether object has earlier or later timestamp than the one in the set
  describe( 'add()', () => {

    it( 'puts object in payload', () => {
      const set = new LwwElementSet()
      set.add( 'a', 1 )
      expect( set.aset ).toEqual( { 'a': 1 } )
    } )

    it( 'updates object in payload if it is already present and newer', () => {
      const set = LwwElementSet.create( { 'a': 1 }, {} )
      set.add( 'a', 2 )
      expect( set.aset ).toEqual( { 'a': 2 } )
    } )

    it( 'remains same object in payload if it is present but older', () => {
      const set = LwwElementSet.create( { 'a': 2 }, {} )
      set.add( 'a', 1 )
      expect( set.aset ).toEqual( { 'a': 2 } )
    } )

    // checks validity of argument
    for( let time of [ -1, 0, null, NaN, '', [], {} ] ) {
      it( `throws expection when time is invalid (${JSON.stringify( time )})`, () => {
        expect( () => {
          new LwwElementSet().add( 'a', time )
        } ).toThrow( InvalidArgumentException )
      } )
    }

  } )

  // two factors
  // 1. whether object is in the set
  // 2. whether object has earlier or later timestamp than the one in the set
  describe( 'remove()', () => {

    it( 'puts object in payload', () => {
      const set = new LwwElementSet()
      set.remove( 'a', 1 )
      expect( set.rset ).toEqual( { 'a': 1 } )
    } )

    it( 'updates object in payload if it is already present and newer', () => {
      const set = LwwElementSet.create( {}, { 'a': 1 } )
      set.remove( 'a', 2 )
      expect( set.rset ).toEqual( { 'a': 2 } )
    } )

    it( 'remains same object in payload if it is present but older', () => {
      const set = LwwElementSet.create( {}, { 'a': 2 } )
      set.remove( 'a', 1 )
      expect( set.rset ).toEqual( { 'a': 2 } )
    } )

    // checks validity of argument
    for( let time of [ -1, 0, null, NaN, '', [], {} ] ) {
      it( `throws expection when time is invalid (${JSON.stringify( time )})`, () => {
        expect( () => {
          new LwwElementSet().remove( 'a', time )
        } ).toThrow( InvalidArgumentException )
      } )
    }

  } )

  // three factors
  // 1. whether the object is in the set
  // 2. whether the object in the set is marked as removed
  // 3. whether the set is biased towards addition or removal
  describe( 'lookup()', () => {

    it( 'returns true if object is in payload', () => {
      const set = LwwElementSet.create( { 'a': 1 }, {} )
      expect( set.lookup( 'a' ) ).toBeTruthy()
    } )

    it( 'returns true if object is in payload, and not marked as removed', () => {
      const set = LwwElementSet.create( { 'a': 2 }, { 'a': 1 } )
      expect( set.lookup( 'a' ) ).toBeTruthy()
    } )

    it( 'returns false if object is in payload, but marked as removed', () => {
      const set = LwwElementSet.create( { 'a': 1 }, { 'a': 2 } )
      expect( set.lookup( 'a' ) ).toBeFalsy()
    } )

    it( 'returns false if object is not in payload', () => {
      const set = LwwElementSet.create( { 'a': 1 }, {} )
      expect( set.lookup( 'b' ) ).toBeFalsy()
    } )

    it( 'returns true if object is in payload biased towards addition, and with same timestamp as one in removal set', () => {
      const set = LwwElementSet.create( { 'a': 1 }, { 'a': 1 } )
      expect( set.lookup( 'a' ) ).toBeTruthy()
    } )

    it( 'returns false if object is in payload biased towards removal, and with same timestamp as one in removal set', () => {
      const set = LwwElementSet.create( { 'a': 1 }, { 'a': 1 }, LwwElementSet.BIAS.BIAS_REMOVAL )
      expect( set.lookup( 'a' ) ).toBeFalsy()
    } )

  } )

  // three factors
  // 1. whether current set is a subset
  // 2. whether objects in difference of current set from the other are marked as removed
  // 3. whether current set is biased towards addition or removal
  describe( 'compare()', () => {

    it( 'returns true if all objects in paylaod of a set are in that of the other', () => {
      const set1 = LwwElementSet.create( { 'a': 1 }, {} )
      const set2 = LwwElementSet.create( { 'a': 1 }, {} )
      expect( set1.compare( set2 ) ).toBeTruthy()
    } )

    it( 'returns false if at least one in payload of a set is missed in that of the other', () => {
      const set1 = LwwElementSet.create( { 'a': 1 }, {} )
      const set2 = LwwElementSet.create( {}, {} )
      expect( set1.compare( set2 ) ).toBeFalsy()
    } )

    it( 'returns false if at least one in payload of a set is in that of the other, but is marked as removed', () => {
      const set1 = LwwElementSet.create( { 'a': 1 }, {} )
      const set2 = LwwElementSet.create( { 'a': 1 }, { 'a': 2 } )
      expect( set1.compare( set2 ) ).toBeFalsy()
    } )

    it( 'returns true if all objects not being marked as removed in payload of a set are in that of the other', () => {
      const set1 = LwwElementSet.create( { 'a': 1, 'b': 1 }, { 'a': 2 } )
      const set2 = LwwElementSet.create( { 'b': 1 }, {} )
      expect( set1.compare( set2 ) ).toBeTruthy()
    } )

    it( 'returns false if at least one not being marked as removed in payload of a set is missed in that of the other', () => {
      const set1 = LwwElementSet.create( { 'a': 1, 'b': 1 }, { 'a': 2 } )
      const set2 = LwwElementSet.create( {}, {} )
      expect( set1.compare( set2 ) ).toBeFalsy()
    } )

    it( 'returns false if at least one not being marked as removed in payload of a set is in that of the other, but is marked as removed', () => {
      const set1 = LwwElementSet.create( { 'a': 1, 'b': 1 }, { 'a': 2 } )
      const set2 = LwwElementSet.create( { 'b': 1 }, { 'b': 2 } )
      expect( set1.compare( set2 ) ).toBeFalsy()
    } )

    // checks validity of argument
    for( let x of [ 0, null, NaN, '', [], {} ] ) {
      it( `throws exception when argument is invalid (${JSON.stringify( x )})`, () => {
        const set = LwwElementSet.create( { 'a': 1 }, {} )
        expect( () => {
          set.compare( x )
        } ).toThrow( InvalidArgumentException )
      } )
    }

  } )

  // one factor
  // 1. whether the created set is biased towards addition or removal
  describe( 'create()', () => {

    it( 'create a set with specified payload', () => {
      const set = LwwElementSet.create( { 'a': 1 }, { 'b': 2 } )
      expect( set.aset ).toEqual( { 'a': 1 } )
      expect( set.rset ).toEqual( { 'b': 2 } )
      expect( set.bias ).toEqual( LwwElementSet.BIAS.BIAS_ADD )
    } )

    it( 'creates a set with specified payload with a removal bias', () => {
      const set = LwwElementSet.create( { 'c': 3 }, { 'd': 4 }, LwwElementSet.BIAS.BIAS_REMOVAL )
      expect( set.aset ).toEqual( { 'c': 3 } )
      expect( set.rset ).toEqual( { 'd': 4 } )
      expect( set.bias ).toEqual( LwwElementSet.BIAS.BIAS_REMOVAL )
    } )

  } )

} )

