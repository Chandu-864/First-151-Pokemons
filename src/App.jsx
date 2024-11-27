
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Input from '../src/Components/Input/Input'
import PokemonDisplayPage from './Components/Pokemon Display Page/PokemonDisplayPage';
import Pokecard from './Components/Pokecard/Pokecard';
import { useState } from 'react';
import { first151Pokemon, getFullPokedexNumber, fullPokemonNumber } from '../src/Utils/index';

function App() {

  const [selectedPokemon, setSelectedPokemon] = useState(0);
  const [input, setInput] = useState('');

  const filteredInput = first151Pokemon.filter( (pokemon, pIndex) => {
    if (pokemon.toLowerCase().includes(input.toLowerCase())) {
      return true;
    }
    if (getFullPokedexNumber(pIndex).includes(input)){
      return true
    }
    return false;
  })


  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path = '/' element = { 
            <>
              < Input selectedPokemon = {selectedPokemon} setSelectedPokemon={setSelectedPokemon} input = {input} setInput = {setInput}/> 
              <Pokecard setSelectedPokemon={setSelectedPokemon} filteredInput = {filteredInput} />
            </>} 
          />
          <Route path='/Pokemon_Data' element = {<PokemonDisplayPage  selectedPokemon = {selectedPokemon} setInput = {setInput} setSelectedPokemon= {setSelectedPokemon} />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
