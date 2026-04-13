import './styles/styleguide.scss'
import Alpine from 'alpinejs'
import { initButtons } from './components/button/button.js'
import { initTextFields } from './components/text-field/text-field.js'

window.Alpine = Alpine
Alpine.start()

initButtons()
initTextFields()
