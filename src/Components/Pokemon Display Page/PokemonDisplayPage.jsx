import React, { Fragment, useEffect, useState } from 'react';
import { getFullPokedexNumber, fullPokemonNumber } from '../../Utils';
import './PokemonDisplayPage.css';
import { pokemonTypeColors } from '../../Utils/index';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaSortAlphaDown, FaSortAlphaDownAlt, FaSort } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import Modal from "../Modal/Modal";

export const PokemonDisplayPage = (props) => {
  const { selectedPokemon, setInput, setSelectedPokemon } = props;

  const [data, setData] = useState(null);
  const [speciesData, setSpeciesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(null);
  const navigateBack = useNavigate();

  const [sortedList, setSortedList] = useState([]);
  const [sortOrder, setSortOrder] = useState('def');
  const [sortColor, setSortColor] = useState('def');
  const [displayMove, setDisplayMove] = useState(null);
  const [moveLoading, setMoveLoading] = useState(false);

  const { name, weight, height, abilities, stats, types, moves, species, sprites, held_items, cries, base_experience } = data || {};

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
    if (selectedPokemon) {
      try {
        localStorage.setItem("selected-Poke", JSON.stringify(selectedPokemon));
      } catch (error) {
        console.error("Error saving Pokemon to localStorage", error);
      }
    }
  }, [selectedPokemon]);

  useEffect(() => {
    if (!moves || moves.length === 0) { return; }

    let movesReq = [...moves];
    if (sortOrder === 'asc') {
      movesReq.sort((a, b) => a.move.name.localeCompare(b.move.name));
    } else if (sortOrder === 'des') {
      movesReq.sort((a, b) => b.move.name.localeCompare(a.move.name));
    } else if (sortOrder === 'def') { }
    setSortedList(movesReq);
  }, [moves, sortOrder]);

  const imageList = Object.keys(sprites || {}).filter((val) => {
    if (!sprites[val]) { return false; }
    if (["versions", "other"].includes(val)) { return false; }
    return true;
  });

  async function handleMoves(moveName, moveUrl) {
    if (loading || !localStorage || !moveUrl) { return; }

    let moveCache = {};
    if (localStorage.getItem("MoveData")) {
      moveCache = JSON.parse(localStorage.getItem("MoveData"));
    }

    if (moveName in moveCache) {
      setDisplayMove(moveCache[moveName]);
      return;
    }

    try {
      setMoveLoading(true);

      const moveRes = await fetch(moveUrl);
      const moveData = await moveRes.json();

      const description = moveData?.flavor_text_entries.filter((val) => {
        return val.version_group.name === 'firered-leafgreen';
      })[0]?.flavor_text;

      const MovesDescription = {
        name: moveName,
        description,
        moveData,
      };

      setDisplayMove(MovesDescription);
      moveCache[moveName] = MovesDescription;
      localStorage.setItem("MoveData", JSON.stringify(moveCache));

    } catch (error) {
      console.error(error);
    } finally {
      setMoveLoading(false);
    }
  }

  useEffect(() => {
    if (!localStorage) {
      return;
    }

    let cache = {};
    if (localStorage.getItem("Pokedex")) {
      cache = JSON.parse(localStorage.getItem("Pokedex"));
    }

    if (cache[selectedPokemon]?.pokeData && cache[selectedPokemon]?.color && cache[selectedPokemon]?.speciesinfo) {
      setData(cache[selectedPokemon].pokeData);
      setBackgroundColor(cache[selectedPokemon].color);
      setSpeciesData(cache[selectedPokemon].speciesinfo);
      setLoading(false);
      return;
    }

    async function fetchPokemonData() {
      try {
        setLoading(true);
        const url = `https://pokeapi.co/api/v2/pokemon/${selectedPokemon}`;
        const res = await fetch(url);
        const pokeData = await res.json();

        const speciesUrl = pokeData.species.url;
        const speciesRes = await fetch(speciesUrl);
        const speciesInfo = await speciesRes.json();
        const color = speciesInfo.color.name;
        setBackgroundColor(color);
        setSpeciesData(speciesInfo);

        setData(pokeData);
        cache[selectedPokemon] = { pokeData, color, speciesInfo };
        localStorage.setItem("Pokedex", JSON.stringify(cache));

      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchPokemonData();
  }, [selectedPokemon]);

  if (loading || !data) {
    return (
      <div>
        <h1>...Loading</h1>
      </div>
    );
  }

  return (
    <div style={{ background: backgroundColor || 'black' }} className='body-page'>
      {displayMove && (
        <Modal handleCloseModal={() => setDisplayMove(null)}>
          <div className='head'>
            <h2>{displayMove.name.replaceAll('-', ' ').toUpperCase()}</h2>
            <span>{displayMove.description}</span>
          </div>
          <div className='otherP'>
            {displayMove?.moveData.accuracy && (
              <>
                <p>Accuracy: </p>
                <span>{displayMove.moveData?.accuracy}</span>
              </>
            )}

            {displayMove?.moveData.contest_type?.name && (
              <>
                <p>Contest type: </p>
                <span>{displayMove.moveData?.contest_type?.name}</span>
              </>
            )}

            {displayMove.moveData?.damage_class?.name && (
              <>
                <p>Damage class: </p>
                <span>{displayMove.moveData?.damage_class?.name}</span>
              </>
            )}

            {displayMove.moveData?.power && (
              <>
                <p>Power: </p>
                <span>{displayMove.moveData?.power}</span>
              </>
            )}

            {displayMove.moveData?.pp && (
              <>
                <p>PP: </p>
                <span>{displayMove.moveData?.pp}</span>
              </>
            )}
          </div>
        </Modal>
      )}
      <button className='back-arrow' onClick={() => { navigateBack('/'); setInput(''); }}>
        <IoMdArrowRoundBack />
      </button>
      <div className='page'>
        <h1 className='poke-name'>{name.slice(0, 1).toUpperCase() + name.slice(1)}</h1>
        <h2 className='poke-index'>#{getFullPokedexNumber(selectedPokemon - 1)}</h2>
        <div className='type-image'>
          <img className="default-img" src={'./Pokemons/' + getFullPokedexNumber(selectedPokemon - 1) + ".png"} draggable={false} alt={`${name} large-img`} width={250} />
          <div className='types'>
            {types.map((typeObj, typeInd) => {
              return (
                <h2 key={typeInd} style={{
                  background: pokemonTypeColors[typeObj?.type?.name].background || 'red',
                  color: pokemonTypeColors[typeObj?.type?.name].color || 'black'
                }}>
                  {typeObj?.type?.name}
                </h2>
              );
            })}
          </div>
        </div>
        <div className='sprite-images'>
          {imageList.map((spriteUrl, spriteIndex) => {
            const imageUrl = sprites[spriteUrl];
            return (
              <img src={imageUrl} alt="" key={spriteIndex} draggable={false} />
            );
          })}
        </div>

        {cries.latest && (
          <div className='audio'>
            <audio controls>
              <source src={cries?.latest} type="audio/ogg" alt="Pokemon-Cry"></source>
            </audio>
          </div>
        )}

        <h3 className='stat-heading'>Stats:</h3>
        <div className="stats-card">
          {stats.map((statObj, statIndex) => {
            const { stat, base_stat } = statObj;
            const progressWidth = `${(base_stat / 160) * 100}%`;
            return (
              <div key={statIndex} className="stat-item">
                <div className='stat-list'>
                  <p><b>{stat?.name.replaceAll('-', ' ').toUpperCase()}</b></p>
                  <p>{base_stat}</p>
                </div>
                <div className='stat-bar'>
                  <p style={{ "--progress-width": progressWidth }} className="progress-bar"></p>
                </div>
              </div>
            );
          })}
        </div>

        <div className='details'>
          <div className='detail-item'>
            <p>Weight: </p>
            <h3>{weight / 10} kg</h3>
          </div>
          <div className='detail-item'>
            <p>Height: </p>
            <h3>{height / 10} m</h3>
          </div>
          <div className='detail-item'>
            <p>Base Experience:</p>
            <h3>{base_experience}</h3>
          </div>
          {held_items.length > 0 && (
            <div className='detail-item'>
              <p>Held Item(s): </p>
              <h3>{held_items.map((itemObj, itemIndex) => itemObj.item.name).join(", ")}</h3>
            </div>
          )}
          {abilities.length > 0 && (
            <div className='detail-item'>
              <p>Abilities: </p>
              <h3>{abilities.map((abilityObj, abilityIndex) => abilityObj.ability.name).join(", ")}</h3>
            </div>
          )}
        </div>

        <div className='moves-section'>
          <div className='sort-button'>
            <button onClick={() => {
              if (sortOrder === 'asc') { setSortOrder('des'); }
              else if (sortOrder === 'des') { setSortOrder('asc'); }
              else { setSortOrder('asc'); }
            }}>
              Sort {sortOrder === 'asc' && <FaSortAlphaDown />}
              {sortOrder === 'des' && <FaSortAlphaDownAlt />}
              {sortOrder === 'def' && <FaSort />}
            </button>
          </div>
          {moves.map((moveObj, moveIndex) => (
            <button className="move-list" key={moveIndex} onClick={() => handleMoves(moveObj.move.name, moveObj.move.url)}>
              <p>{moveObj.move.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
