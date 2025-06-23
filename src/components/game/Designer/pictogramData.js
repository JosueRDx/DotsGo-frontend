import bateriasIcon from '../../../assets/images/pictograms/baterias.svg';
import botellaIcon from '../../../assets/images/pictograms/botella.svg';
import calaveraIcon from '../../../assets/images/pictograms/calavera.svg';
import corrosivoIcon from '../../../assets/images/pictograms/corrosivo.svg';
import explosivoIcon from '../../../assets/images/pictograms/explosivo.svg';
import fuegoIcon from '../../../assets/images/pictograms/fuego.svg';
import oxidanteIcon from '../../../assets/images/pictograms/oxidante.svg';
import radioactivoIcon from '../../../assets/images/pictograms/radioactivo.svg';
import riesgoBiologicoIcon from '../../../assets/images/pictograms/riesgo-biologico.svg';

export const availableColors = [
  { id: 'orange_solid', name: 'Naranja', type: 'solid', value: '#FF9900' },
  { id: 'red_solid', name: 'Rojo', type: 'solid', value: '#DC2626' },
  { id: 'green_solid', name: 'Verde', type: 'solid', value: '#16A34A' },
  { id: 'white_solid', name: 'Blanco', type: 'solid', value: '#FFFFFF', borderColor: '#000000' },
  { id: 'yellow_solid', name: 'Amarillo', type: 'solid', value: '#FACC15' },
  { id: 'blue_solid', name: 'Azul', type: 'solid', value: '#2563EB' },
  { id: 'black_solid', name: 'Negro', type: 'solid', value: '#000000' },
  {
    id: 'black_stripes',
    name: 'Rayas Negras',
    type: 'pattern',
    value: 'repeating-linear-gradient(90deg, #000000 0 25px, #FFFFFF 25px 50px)'
  },
  {
    id: 'red_stripes',
    name: 'Rayas Rojas',
    type: 'pattern',
    value: 'repeating-linear-gradient(90deg, #DC2626 0 25px, #FFFFFF 25px 50px)'
  }
];

export const availableSymbols = [
  { id: 'explosivo', name: 'Explosión', path: explosivoIcon, defaultSymbolColor: 'black' },
  { id: 'fuego', name: 'Llama', path: fuegoIcon, defaultSymbolColor: 'black' },
  { id: 'oxidante', name: 'Oxidante', path: oxidanteIcon, defaultSymbolColor: 'black' },
  { id: 'botella', name: 'Botella de Gas', path: botellaIcon, defaultSymbolColor: 'black' },
  { id: 'calavera', name: 'Calavera (Tóxico)', path: calaveraIcon, defaultSymbolColor: 'black' },
  { id: 'corrosivo', name: 'Corrosión', path: corrosivoIcon, defaultSymbolColor: 'black' },
  { id: 'radioactivo', name: 'Radiactividad', path: radioactivoIcon, defaultSymbolColor: 'black' },
  { id: 'riesgo_biologico', name: 'Riesgo Biológico', path: riesgoBiologicoIcon, defaultSymbolColor: 'black' },
  { id: 'baterias', name: 'Baterías', path: bateriasIcon, defaultSymbolColor: 'black' },
  { id: 'no_symbol', name: 'Sin Símbolo', path: null },
];

export const availableNumbers = [
  '1','2','2.1','2.2','2.3','3','4','4.1','4.2','4.3','5.1','5.2','6.1','6.2','7','8','9',
];