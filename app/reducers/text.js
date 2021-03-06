export default function (state = {}, action) {
  switch (action.type) {
    case 'UPDATE_STRING':
      return { ...state, string: action.string };
    case 'UPDATE_X':
      return { ...state, x: action.x };
    case 'UPDATE_Y':
      return { ...state, y: action.y };
    case 'UPDATE_SIZE':
      return { ...state, size: action.size };
    case 'UPDATE_FONT':
      return { ...state, font: action.font };
    case 'UPDATE_COLOR':
      return { ...state, color: action.color };
    case 'RESET_TEXT':
      return { string: '',
               x: 0,
               y: 30,
               size: 16,
               font: 'Arial',
               color: '#ff0000'
            };
    default:
      return state;
  }
}
