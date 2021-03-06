import React, { Component } from 'react';
import { render } from 'react-dom';
import Dock from 'react-dock';
import Root from '../../app/containers/Root';
import createStore from '../../app/store/configureStore';
import { replaceImages, unselectAllImages } from '../../app/actions/images';
import { toggleVisibility } from '../../app/actions/visibility';
import uuid from 'uuid';
import { removeAllCanvasImages } from '../../app/actions/canvas';
import { resetStep } from '../../app/actions/step';
import { toggleImagesOnPage } from '../../app/actions/imagesOnPage';
import { resetText } from '../../app/actions/text';
import { setFilter } from '../../app/actions/filter';


// TODO: Export to config file import
const PIN_WIDTH = 100;
const MIN_PIN_HEIGHT = 100;
const alertMessage = 'Oops! That button doesn\'t work on Pinterest. Try using' +
                      ' the red Save button at the top of any Pin.';

let handleExtensionClick = () => {};
let checkImages = () => {};

class InjectApp extends Component {
  constructor(props) {
    super(props);

    this.store = createStore({
      images: [],
      isVisible: false,
      isVisibleNUX: false,
      step: 1,
      imagesOnPage: false,
      text: { string: '',
             x: 0,
             y: 30,
             size: 16,
             font: 'Arial',
             color: '#ff0000'
           },
      filter: 'none'
    });


    this.store.subscribe(this.forceUpdate.bind(this));

    handleExtensionClick = () => this.buttonOnClick();
    checkImages = () => this.populateImagesIntoStore();
  }

  populateImagesIntoStore = () => {
    const images = [];
    const urls = [];
    const host = window.location.hostname;
    document.querySelectorAll('img').forEach((img) => {
      const parser = document.createElement('a');
      parser.href = img.src;
      if (img.width >= PIN_WIDTH &&
        (parser.hostname.indexOf(host) !== -1 || host.indexOf(parser.hostname) !== -1) &&
        img.height >= MIN_PIN_HEIGHT && /* min height */
        img.src.substring(0, 5) !== 'data:' && /* not B64 */
        img.src !== '' && urls.indexOf(img.src) === -1) {
        urls.push(img.src);
        images.push({
          id: uuid.v1(),
          url: img.src,
          width: img.width,
          height: img.height,
          isSelected: false,
        });
      }
    });
    if (images.length > 0) {
      this.store.dispatch(toggleImagesOnPage(true));
    } else {
      this.store.dispatch(toggleImagesOnPage(false));
    }
    this.store.dispatch(replaceImages(images));
    return (images.length > 0);
  }

  buttonOnClick = () => {
    if (window.location.href.indexOf('pinterest.com') !== -1) {
      alert(alertMessage);
    } else if (this.store.getState().imagesOnPage) {
      this.validSite = true;
      const isVisible = !this.store.getState().isVisible;
      this.store.dispatch(toggleVisibility(isVisible));

      this.populateImagesIntoStore();

      if (isVisible) {
        this.store.dispatch(resetStep());
        this.store.dispatch(unselectAllImages(this.store.getState('images').images));
        document.body.style.overflow = 'hidden';
        document.body.style.top = 0;
        document.body.style.right = 0;
        document.body.style.bottom = 0;
        document.body.style.left = 0;
      } else {
        this.store.dispatch(resetText());
        this.store.dispatch(setFilter('none'));
        this.store.dispatch(removeAllCanvasImages());
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
      }
    } else {
      alert('Oops! Either no images on this site, or images not granted access to be used.');
    }
  };

  render() {
    return (
      <Dock
        position="bottom"
        dimMode="transparent"
        defaultSize={1}
        isVisible={this.store.getState().isVisible}
        dockStyle={{ background: 'rgba(0,0,0,0.8)' }}
      >
        <Root store={this.store} />,
      </Dock>
    );
  }
}

window.addEventListener('load', () => {
  const injectDOM = document.createElement('div');
  injectDOM.className = 'pinterest-layout-ext';
  injectDOM.style.textAlign = 'center';
  document.body.appendChild(injectDOM);
  render(<InjectApp />, injectDOM);
});

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.toggle) {
      handleExtensionClick();
    }
    sendResponse({ farewell: checkImages() });
  });
