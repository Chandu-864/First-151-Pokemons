import React from 'react'
import './Pokecard.css'
import {first151Pokemon, getFullPokedexNumber, getPokedexNumber, fullPokemonNumber} from '../../Utils/index'
import { useNavigate } from 'react-router-dom';


export const Pokecard = (props) => {

  const {setSelectedPokemon, filteredInput} = props;  

  const navigatePage = useNavigate();

  const cardFunction = (pokemon, pokIndex) => {
    setSelectedPokemon(getPokedexNumber(first151Pokemon.indexOf(pokemon)))
    navigatePage('/Pokemon_Data')
  }


  return (
    <>
      <div className='grid-layout'>
        {
          filteredInput.map ( (pokemon, pokIndex) => {
            return (
              <button className='card' key={pokIndex} onClick={ () => cardFunction(pokemon, pokIndex)} >
                <img src={'./Pokemons/' + getFullPokedexNumber(first151Pokemon.indexOf(pokemon)) + '.png'} draggable={false} />
                <h2>{pokemon}</h2>
                <h2>{getFullPokedexNumber(first151Pokemon.indexOf(pokemon))}</h2>
              </button>
            )
          })
        }
      </div>
      {filteredInput.length > 20 && 
        <div className='scroll-top'>
          <button className='scroll' onClick={()=>scrollTo({top:0, left:0, behavior:"smooth"})}>Scroll-to-Top</button>
        </div>
      }
    </>
  )
}

export default Pokecard