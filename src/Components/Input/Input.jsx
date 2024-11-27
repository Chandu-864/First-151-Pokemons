import React, { useEffect, useState } from 'react'
import './Input.css'
import PokemonName from "../../assets/Pokemon_Name.png";

export const Input = (props) => {

  const {selectedPokemon, setSelectedPokemon, input, setInput} = props

  return (
    <div className='input-field'>
      <label htmlFor="input-box"><img src={PokemonName} alt="Pokemon Logo"  draggable={false} /></label>
      <input type="text" placeholder='Ex: 02 or Bulb' id='input-box' value={input} onChange={(e)=>{setInput(e.target.value)}}/>
    </div>
  )
}

export default Input