function Exception( msg ) {
  this.msg = msg

  this.toString = () => {
    return this.msg
  }
}

export function InvalidArgumentException( msg ) {
  Exception.call( this, msg )
}

export function InvalidLengthException( msg ) {
  Exception.call( this, msg )
}

