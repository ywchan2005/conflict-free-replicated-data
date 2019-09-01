import { GrowOnlySet } from '../grow_only_set'
import { InvalidArgumentException } from '../errors'

describe( 'GrowOnlySet', () => {

  it( 'allocates an empty set', () => {
    const set = new GrowOnlySet()
    expect( set.payload.size ).toEqual( 0 )
  } )

  describe( 'merge()', () => {

    it( 'is commutative', () => {
      const set1 = new GrowOnlySet()
      const set2 = new GrowOnlySet()
      const [ c1, c2 ] = [ [ 1, 2 ], [ 2, 3 ] ]
      set1
        .merge( GrowOnlySet.create( c1 ) )
        .merge( GrowOnlySet.create( c2 ) )
      set2
        .merge( GrowOnlySet.create( c2 ) )
        .merge( GrowOnlySet.create( c1 ) )
      expect( set1.payload ).toEqual( new Set( [ 1, 2, 3 ] ) )
      expect( set2.payload ).toEqual( new Set( [ 1, 2, 3 ] ) )
    } )

    it( 'shuold be associative', () => {
      const set1 = new GrowOnlySet()
      const set2 = new GrowOnlySet()
      const [ c1, c2, c3 ] = [ [ 1, 2 ], [ 2, 3 ], [ 1, 4 ] ]
      set1
        .merge( GrowOnlySet.create( c1 ) )
        .merge( GrowOnlySet.create( c2 )
          .merge( GrowOnlySet.create( c3 ) ) )
      set2
        .merge( GrowOnlySet.create( c1 )
          .merge( GrowOnlySet.create( c2 ) ) )
        .merge( GrowOnlySet.create( c3 ) )
      expect( set1.payload ).toEqual( new Set( [ 1, 2, 3, 4 ] ) )
      expect( set2.payload ).toEqual( new Set( [ 1, 2, 3, 4 ] ) )
    } )

    it( 'is idempotent', () => {
      const set1 = new GrowOnlySet()
      const set2 = new GrowOnlySet()
      const c1 = [ 2, 3, 4 ]
      set1
        .merge( GrowOnlySet.create( c1 ) )
        .merge( GrowOnlySet.create( c1 ) )
      set2
        .merge( GrowOnlySet.create( c1 ) )
      expect( set1.payload ).toEqual( set2.payload )
    } )

    for( let x of [ 0, null, NaN, '', [], {} ] ) {
      it( `throws exception when argument is invalid (${JSON.stringify( x )})`, () => {
        const set = GrowOnlySet.create( [ 1 ] )
        expect( () => {
          set.merge( x )
        } ).toThrow( InvalidArgumentException )
      } )
    }

  } )

  describe( 'add()', () => {

    it( 'puts object in payload', () => {
      const set = GrowOnlySet.create( [ 1, 2 ] )
      set.add( 3 )
      expect( set.payload ).toEqual( new Set( [ 1, 2, 3 ] ) )
    } )

    it( 'remains the same if object to be added is already in the payload', () => {
      const set = GrowOnlySet.create( [ 1, 2 ] )
      set.add( 2 )
      expect( set.payload ).toEqual( new Set( [ 1, 2 ] ) )
    } )

  } )

  describe( 'lookup()', () => {

    it( 'returns true if object is in payload', () => {
      const set = GrowOnlySet.create( [ 1, 2 ] )
      expect( set.lookup( 1 ) ).toBeTruthy()
    } )

    it( 'returns false if object is not in payload', () => {
      const set = GrowOnlySet.create( [ 1, 2 ] )
      expect( set.lookup( 3 ) ).toBeFalsy()
    } )

  } )

  describe( 'compare()', () => {

    it( 'returns true if all objects in payload of a set is in that of the other', () => {
      const set1 = GrowOnlySet.create( [ 1, 2 ] )
      const set2 = GrowOnlySet.create( [ 1, 2, 3 ] )
      expect( set1.compare( set2 ) ).toBeTruthy()
    } )

    it( 'returns false if at least one object in payload of a set is missed in that of the other', () => {
      const set1 = GrowOnlySet.create( [ 1, 2 ] )
      const set2 = GrowOnlySet.create( [ 2, 3 ] )
      expect( set1.compare( set2 ) ).toBeFalsy()
    } )

    for( let x of [ 0, null, NaN, '', [], {} ] ) {
      it( `throws exception when argument is invalid (${JSON.stringify( x )})`, () => {
        const set = GrowOnlySet.create( [ 1 ] )
        expect( () => {
          set.compare( x )
        } ).toThrow( InvalidArgumentException )
      } )
    }

  } )

  describe( 'create()', () => {

    it( 'create a set with specified payload', () => {
      const set = GrowOnlySet.create( [ 1, 2 ] )
      expect( set.payload ).toEqual( new Set( [ 1, 2 ] ) )
    } )

  } )

} )

