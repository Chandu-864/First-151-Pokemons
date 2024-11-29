import React, { Fragment, useEffect, useState } from 'react'
import { getFullPokedexNumber, fullPokemonNumber } from '../../Utils';
import './PokemonDisplayPage.css'
import {pokemonTypeColors} from '../../Utils/index'
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaSortAlphaDown } from "react-icons/fa";
import { FaSortAlphaDownAlt } from "react-icons/fa";
import { FaSort } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import Modal from "../Modal/Modal";

export const PokemonDisplayPage = (props) => {

  const {selectedPokemon, setInput, setSelectedPokemon} = props;

  const [data, setData] = useState(null);
  const [speciesData, setSpeciesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(null);
  const navigateBack = useNavigate();

  const [sortedList, setSortedList] = useState([]);
  const [sortOrder, setSortorder] = useState('def');
  const [sortCOlor, setSortColor] = useState('def')
  const [displayMove, setDisplayMove] = useState(null);
  const [moveLoading, setMoveLoading] = useState(false);

  const {name, weight, height, abilities, stats, types, moves, species, sprites, held_items, cries, base_experience} = data || {};


  // Load saved Pokemon from localStorage when the component mounts
useEffect(() => {
  const savedPokemon = localStorage.getItem("selected-Poke");
  if (savedPokemon) {
    try {
      const parsedPokemon = JSON.parse(savedPokemon);
      setSelectedPokemon(parsedPokemon);
    } catch (error) {
      console.error("Error parsing saved Pokemon", error);
    }
  }
}, []);

// Save selected Pokemon to localStorage whenever it changes
useEffect(() => {
  if (selectedPokemon) { // Only save if selectedPokemon is valid
    try {
      localStorage.setItem("selected-Poke", JSON.stringify(selectedPokemon));
    } catch (error) {
      console.error("Error saving Pokemon to localStorage", error);
    }
  }
}, [selectedPokemon]);



  useEffect( ()=> {
    if (!moves || moves.length === 0 ) {return};

    let movesReq = [...moves];
    if (sortOrder === 'asc') {
      movesReq.sort ( (a,b) => a.move.name.localeCompare(b.move.name))
    }
    else if (sortOrder === 'des') {
      movesReq.sort ( (a,b) => b.move.name.localeCompare(a.move.name)) 
    }
    else if (sortOrder === 'def') {}
    setSortedList(movesReq)
  },[moves, sortOrder])


  const imageList = Object.keys(sprites || {}).filter ( (val) => {
    if (!sprites[val]){return false};
    if (["versions", "other"].includes(val)){return false}
    return true;
  })

  async function handleMoves(moveName, moveUrl) {

    if (loading || !localStorage || !moveUrl) {return};

    let movecache = {};
    if (localStorage.getItem("MoveData")) {
      movecache = JSON.parse(localStorage.getItem("MoveData"));
    }

    if (moveName in movecache) {
      setDisplayMove(movecache[moveName])
      return;
    }

    
    try {

      setMoveLoading(true);

      const moveRes = await fetch(moveUrl);
      const moveData = await moveRes.json();

      const description = moveData?.flavor_text_entries.filter((val) => {
        return val.version_group.name === 'firered-leafgreen'
      })[0]?.flavor_text

      const MovesDescription = {
        name: moveName,
        description,
        moveData,
      }

      setDisplayMove(MovesDescription);
      movecache[moveName] = MovesDescription;
      localStorage.setItem("MoveData", JSON.stringify(movecache));
      
    } catch (error) {
      console.error(error);
    }
    finally {
      setMoveLoading(false);
    }
  }

  useEffect( ()=> {

    if(!localStorage) {
      return;
    }

    let cache = {};
    if (localStorage.getItem("Pokedex")) {
      cache = JSON.parse(localStorage.getItem("Pokedex"));
    }

    if (cache[selectedPokemon]?.pokeData && cache[selectedPokemon]?.color && cache[selectedPokemon]?.speciesinfo) {
      setData(cache[selectedPokemon].pokeData);
      setBackgroundColor(cache[selectedPokemon].color)
      setSpeciesData(cache[selectedPokemon].speciesinfo)
      setLoading(false);
      return;
    }

    async function fetchPokemonData() {

      try {
        setLoading(true);
        const url = `https://pokeapi.co/api/v2/pokemon/${selectedPokemon}`;
        const res = await fetch(url);
        const pokeData = await res.json();

        const speciesurl = pokeData.species.url;
        const speciesRes = await fetch(speciesurl);
        const speciesinfo = await speciesRes.json();
        const color = speciesinfo.color.name;
        setBackgroundColor(color);
        setSpeciesData(speciesinfo);

        setData(pokeData)
        cache[selectedPokemon] = {pokeData, color, speciesinfo};
        localStorage.setItem("Pokedex", JSON.stringify(cache));
        
      } catch (error) {
        console.log(error);
      }
      finally {
        setLoading(false)
      }
    }

    fetchPokemonData();

  },[selectedPokemon] )

  if (loading || !data) {
    return (
      <div>
        <h1>...Loading</h1>
      </div>
    )
  }


  

  
  
  return (
    <div style={{background: backgroundColor || black}} className='body-page'>
      { displayMove && 
                (<Modal handleCloseModal = {() => setDisplayMove(null)} >
                    <div className='head'>
                        <h2>{displayMove.name.replaceAll('-', ' ').toUpperCase()}</h2>
                        <span>{displayMove.description}</span>
                    </div>
                    <div className='otherP'>
                        {displayMove?.moveData.accuracy ? (
                          <>
                            <p>Accuracy: </p>
                            <span>{displayMove.moveData?.accuracy}</span>
                          </>) : '' }

                          {displayMove?.moveData.contest_type?.name ? (
                          <>
                            <p>Contest type: </p>
                            <span>{displayMove.moveData?.contest_type?.name}</span>
                          </>) : '' }

                          {displayMove.moveData?.damage_class?.name ? (
                          <>
                            <p>Damage class: </p>
                            <span>{displayMove.moveData?.damage_class?.name}</span>
                          </>) : '' }
                          
                          {displayMove.moveData?.power ? (
                          <>
                            <p>Power: </p>
                            <span>{displayMove.moveData?.power}</span>
                          </>) : '' }

                          {displayMove.moveData?.pp ? (
                          <>
                            <p>PP: </p>
                            <span>{displayMove.moveData?.pp}</span>
                          </>) : '' }
                    </div>
                   
                  </Modal>
                )
      }
      <button className='back-arrow' onClick={()=>{navigateBack('/');setInput('')}}><IoMdArrowRoundBack /></button>
      <div className='page'>
        <h1 className='poke-name'>{name.slice(0,1).toUpperCase() + name.slice(1) }</h1>
        <h2 className='poke-index'>#{getFullPokedexNumber(selectedPokemon-1)}</h2>
        <div className='type-image'>
        <img className="default-img" src={'./Pokemons/' + getFullPokedexNumber(selectedPokemon-1) + ".png"} draggable={false} alt={`${name} large-img`} width={250} />
        <div className='types'>
            {
              types.map( (typeObj, typeInd) => {
                return (
                  <h2 key={typeInd} style={{background: pokemonTypeColors[typeObj?.type?.name].background || red, color: pokemonTypeColors[typeObj?.type?.name].color || black}}>{typeObj?.type?.name}</h2>
                )
              })
            }
          </div>
        </div>
        <div className='sprite-images'>
          {
            imageList.map( (spriteUrl, spriteIndex) => {
              const imageUrl = sprites[spriteUrl]
              return (
                <img src={imageUrl} alt="" key={spriteIndex}  draggable={false} />
              )
            })
          }
        </div>
        
        {cries.latest ? (
          <div className='audio'>
            <audio controls> 
              <source src={cries?.latest} type="audio/ogg" alt= "Pokemon-Cry" ></source>
            </audio>
          </div>): ''
        }

        <h3 className='stat-heading'>Stats:</h3>
        <div className="stats-card">
          {stats.map( (statObj, statIndex) => {
            const {stat, base_stat} = statObj;
            const progressWidth = `${(base_stat/160)*100}%`;
            return (
              <div key={statIndex} className="stat-item">
                <div className='stat-list'>
                  <p><b>{stat?.name.replaceAll('-',' ').toUpperCase()}</b></p>
                  <p>{base_stat}</p>
                </div>
            
                <div className='stat-bar'>
                  <p style={{ "--progress-width": progressWidth }} className= {`progress-bar ${stat?.name.replaceAll('-','_').toLowerCase()}`}></p>
                </div>
              </div>
                )
            })}
        </div>

        <h3 className='profile-head'>Profile:</h3>
        {speciesData ? (
          <div className='profile'>
            <p>Height: </p>
            <span>{height/10} m</span>
            <p>weight: </p>
            <span>{weight/10} kg</span>
            <p>Base Expience: </p>
            <span>{base_experience}</span>
            <p>Held-itmes: </p>
            <span>{(held_items && held_items.length > 0) ? held_items.map( (itemList)=>itemList.item.name.slice(0,1).toUpperCase() + itemList.item.name.slice(1)) : "No-items held"}</span>
            <p>Abilities: </p>
            <span> {abilities.map( (abilityName, abIndex) => (
              <React.Fragment key={abilityName.ability?.name}>
                  {(abilityName.ability?.name.slice(0,1).toUpperCase() + 
                  abilityName.ability?.name.slice(1)).replaceAll('-', ' ')}
                  {(abIndex < (abilities.length-1)) && ', '}
                  {(abIndex + 1) % 2 === 0 && <br />}
                </React.Fragment>))
              }
            </span>
            <p>Egg groups: </p>
            <span>{speciesData.egg_groups.map( (egg) => egg.name.slice(0,1).toUpperCase() + egg.name.slice(1)).join(', ')}</span>
            <p>Growth rate: </p>
            <span>{speciesData.growth_rate.name.slice(0,1).toUpperCase() + speciesData.growth_rate.name.slice(1)}</span>
            <p>Habitat: </p>
            <span>{speciesData.habitat.name.slice(0,1).toUpperCase() + speciesData.habitat.name.slice(1)}</span>
            <p>Hatch count:</p>
            <span>{speciesData.hatch_counter}</span>
            <p>Capture-rate: </p>
            <span>{speciesData.capture_rate}</span>
            <p>Base happiness: </p>
            <span>{speciesData.base_happiness}</span>
            
            {speciesData && speciesData.evolves_from_species ? (
              <>
                <p>Evolves from: </p>
                <span>{speciesData.evolves_from_species.name.slice(0,1).toUpperCase() + speciesData.evolves_from_species.name.slice(1)}</span>
              </>
            ): (
              <>
                <p>Evolution: </p>
                <span>1st Evolution</span>
              </>
            )
            }
            <p>Shape: </p>
            <span>{speciesData.shape.name.slice(0,1).toUpperCase() + speciesData.shape.name.slice(1)}</span>
          </div>
        ) : (<span>...Loading</span>)}

        {speciesData ? (
          <p className='text-entry'>{speciesData.flavor_text_entries[0].flavor_text}</p>
        ): <h3>...Loading</h3>}

        <hr></hr>
            

        <h3 className='move-heading'>Moves: 
            <FaSortAlphaDownAlt className={`z-a ${sortCOlor === 'des' ? 'active' : ''}`} onClick={()=>{setSortorder('des');setSortColor('des')}}/>
            <FaSort className={`default-sort ${sortCOlor === 'def' ? 'active' : ''}`} onClick={()=>{setSortorder('def');setSortColor('def')}} />
            <FaSortAlphaDown className={`a-z ${sortCOlor === 'asc' ? 'active' : ''}`} onClick={() => {setSortorder('asc');setSortColor('asc')}} /> 
        </h3>
        <div className='poke-moves'>
                {
                  sortedList.map( (moveObj, moveIndex) => {
                    return (
                      <button onClick={() => handleMoves( (moveObj?.move?.name), (moveObj?.move?.url))} key={moveIndex}>{(moveObj?.move?.name.slice(0,1).toUpperCase() + moveObj?.move?.name.slice(1)).replaceAll('-', ' ')}</button>
                    )
                  })
                }
        </div>
      </div>
    </div>
  )

}

export default PokemonDisplayPage
