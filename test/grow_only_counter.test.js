import { GrowOnlyCounter } from '../grow_only_counter'
import { InvalidArgumentException, InvalidLengthException } from '../errors'

describe( 'GrowOnlyCounter', () => {

  it( 'allocates slots of specified length and initializes all to be zeros', () => {
    const counter = new GrowOnlyCounter( 2 )
    expect( counter.payload ).toHaveLength( 2 )
    expect( counter.payload ).toEqual( [ 0, 0 ] )
  } )

  for( let x of [ -1, 0, null, NaN, '', [], {} ] ) {
    it( `throws excpetion when length specified is invalid (${JSON.stringify( x )})`, () => {
      expect( () => {
        new GrowOnlyCounter( x )
      } ).toThrow( InvalidArgumentException )
    } )
  }

  describe( 'merge()', () => {

    it( 'is commutative', () => {
      const counter1 = GrowOnlyCounter.create( [ 1, 1, 1 ] )
      const counter2 = GrowOnlyCounter.create( [ 2, 2, 2 ] )
      expect( counter1.payload ).not.toEqual( counter2.payload )
      const [ c1, c2 ] = [ [ 3, 4, 5 ], [ 3, 3, 6 ] ]
      counter1
        .merge( GrowOnlyCounter.create( c1 ) )
        .merge( GrowOnlyCounter.create( c2 ) )
      counter2
        .merge( GrowOnlyCounter.create( c2 ) )
        .merge( GrowOnlyCounter.create( c1 ) )
      expect( counter1.payload ).toEqual( [ 3, 4, 6 ] )
      expect( counter2.payload ).toEqual( [ 3, 4, 6 ] )
    } )

    it( 'shuold be associative', () => {
      const counter1 = GrowOnlyCounter.create( [ 1, 1, 1 ] )
      const counter2 = GrowOnlyCounter.create( [ 2, 2, 2 ] )
      expect( counter1.payload ).not.toEqual( counter2.payload )
      const [ c1, c2, c3 ] = [ [ 3, 4, 5 ], [ 3, 3, 6 ], [ 3, 7, 3 ] ]
      counter1
        .merge( GrowOnlyCounter.create( c1 ) )
        .merge( GrowOnlyCounter.create( c2 )
          .merge( GrowOnlyCounter.create( c3 ) ) )
      counter2
        .merge( GrowOnlyCounter.create( c1 )
          .merge( GrowOnlyCounter.create( c2 ) ) )
        .merge( GrowOnlyCounter.create( c3 ) )
      expect( counter1.payload ).toEqual( [ 3, 7, 6 ] )
      expect( counter2.payload ).toEqual( [ 3, 7, 6 ] )
    } )

    it( 'is idempotent', () => {
      const counter1 = GrowOnlyCounter.create( [ 1, 1, 1 ] )
      const counter2 = GrowOnlyCounter.create( [ 2, 2, 2 ] )
      expect( counter1.payload ).not.toEqual( counter2.payload )
      const c1 = [ 2, 3, 4 ]
      counter1
        .merge( GrowOnlyCounter.create( c1 ) )
        .merge( GrowOnlyCounter.create( c1 ) )
      counter2
        .merge( GrowOnlyCounter.create( c1 ) )
      expect( counter1.payload ).toEqual( counter2.payload )
    } )

    it( 'throws exception when lengths mismatch', () => {
      expect( () => {
        GrowOnlyCounter.create( [ 1 ] ).merge( GrowOnlyCounter.create( [ 1, 2 ] ) )
      } ).toThrow( InvalidLengthException )
    } )

    for( let x of [ 0, null, NaN, '', [], {} ] ) {
      it( `throws exception when argument is invalid (${JSON.stringify( x )})`, () => {
        const counter = GrowOnlyCounter.create( [ 1 ] )
        expect( () => {
          counter.merge( x )
        } ).toThrow( InvalidArgumentException )
      } )
    }

  } )

  describe( 'increment()', () => {

    it( 'increments specified slot by one', () => {
      const counter = GrowOnlyCounter.create( [ 1, 2 ] )
      counter.increment( 1 )
      expect( counter.payload ).toEqual( [ 1, 3 ] )
    } )

    it( 'throws exception when index exceeds length of counter', () => {
      expect( () => {
        GrowOnlyCounter.create( [ 1 ] ).increment( 2 )
      } ).toThrow( InvalidArgumentException )
    } )

    for( let x of [ -1, null, NaN, '', [], {} ] ) {
      it( `throws exception when index is invalid (${JSON.stringify( x )})`, () => {
        expect( () => {
          GrowOnlyCounter.create( [ 1 ] ).increment( x )
        } ).toThrow( InvalidArgumentException )
      } )
    }

  } )

  describe( 'value()', () => {

    it( 'calculates sum of slots in counter', () => {
      const counter = GrowOnlyCounter.create( [ 1, 2, 3 ] )
      expect( counter.value() ).toEqual( 6 )
    } )

  } )

  describe( 'compare()', () => {

    it( 'returns true if no slot in a counter is greater than the other', () => {
      const counter1 = GrowOnlyCounter.create( [ 1, 2 ] )
      const counter2 = GrowOnlyCounter.create( [ 2, 2 ] )
      expect( counter1.compare( counter2 ) ).toBeTruthy()
    } )

    it( 'returns false if at least one of slots in a counter is greater than the other', () => {
      const counter1 = GrowOnlyCounter.create( [ 3, 2 ] )
      const counter2 = GrowOnlyCounter.create( [ 2, 2 ] )
      expect( counter1.compare( counter2 ) ).toBeFalsy()
    } )

    it( 'throws exception when lengths mismatch', () => {
      expect( () => {
        GrowOnlyCounter.create( [ 1 ] ).compare( GrowOnlyCounter.create( [ 1, 2 ] ) )
      } ).toThrow( InvalidLengthException )
    } )

    for( let x of [ 0, null, NaN, '', [], {} ] ) {
      it( `throws exception when argument is invalid (${JSON.stringify( x )})`, () => {
        const counter = GrowOnlyCounter.create( [ 1 ] )
        expect( () => {
          counter.compare( x )
        } ).toThrow( InvalidArgumentException )
      } )
    }

  } )

  describe( 'create()', () => {

    it( 'create a counter with specified payload', () => {
      const counter = GrowOnlyCounter.create( [ 1, 2 ] )
      expect( counter.payload ).toHaveLength( 2 )
      expect( counter.payload ).toEqual( [ 1, 2 ] )
    } )

  } )

} )

