import React, { Fragment, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import GracefulImage from 'react-graceful-image';
import loadImage from 'blueimp-load-image';

import { updatePopup, updateCustomEditor, updateCustomData } from '../actions';
import { CUSTOM_EDITOR_POPUP } from '../types/const';
import { getCustomEditor } from '../selectors';
import { isObject, isString, isNumber, throttle } from '../utils';
import { dialogBgFMV, dialogFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useTailwind } from '.';

const CustomEditorPopup = () => {

  const { height: safeAreaHeight } = useSafeAreaFrame();
  const isShown = useSelector(state => state.display.isCustomEditorPopupShown);
  const customEditor = useSelector(state => getCustomEditor(state));
  const cancelBtn = useRef(null);
  const uploadImageInput = useRef(null);
  const imageCanvas = useRef(null);
  const zoomInput = useRef(null);
  const isGrabbing = useRef(false);
  const didClick = useRef(false);
  const prevTouches = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const cWidthRef = useRef(0);
  const cHeightRef = useRef(0);
  const maxTranslateXRef = useRef(0);
  const maxTranslateYRef = useRef(0);

  const onPopupCloseBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(CUSTOM_EDITOR_POPUP, false));
    didClick.current = true;
  };

  const _onSaveBtnClick = (title, processedImage, imageFileName, imageFileType) => {
    dispatch(updateCustomData(title, processedImage, imageFileName, imageFileType));
  };

  const onSaveBtnClick = () => {
    if (didClick.current) return;
    onPopupCloseBtnClick();
    didClick.current = true;

    const { title, image, translateX, translateY, zoom } = customEditor;

    if (!isObject(image)) {
      _onSaveBtnClick(title, image, null, null);
      return;
    }

    const imageAspectRatio = 7 / 12;
    const zoomRatio = ((zoom / 50) + 1);

    const [cWidth, cHeight] = [cWidthRef.current, cHeightRef.current];

    let sX, sY, sWidth, sHeight;
    if (image.image.height / image.image.width < imageAspectRatio) {
      sX = (translateX / zoomRatio) * image.image.height / cHeight;
      sY = (translateY / zoomRatio) * image.image.height / cHeight;
      sWidth = (cWidth / zoomRatio) * image.image.height / cHeight;
      sHeight = (cHeight / zoomRatio) * image.image.height / cHeight;
    } else {
      sX = (translateX / zoomRatio) * image.image.width / cWidth;
      sY = (translateY / zoomRatio) * image.image.width / cWidth;
      sWidth = (cWidth / zoomRatio) * image.image.width / cWidth;
      sHeight = (cHeight / zoomRatio) * image.image.width / cWidth;
    }
    [sX, sY] = [Math.round(sX), Math.round(sY)];
    [sWidth, sHeight] = [Math.round(sWidth), Math.round(sHeight)];

    const [dX, dY] = [0, 0];

    // Set max width and height with the same aspect ratio
    let [dWidth, dHeight] = [sWidth, sHeight];
    if (sWidth > 1024 || sHeight > 597) {
      if (sWidth > sHeight) {
        dWidth = 1024;
        dHeight = sHeight / sWidth * 1024;
      } else {
        dWidth = sWidth / sHeight * 597;
        dHeight = 597;
      }
    }

    const canvas = /* @type HTMLCanvasElement */(document.createElement('canvas'));
    [canvas.width, canvas.height] = [dWidth, dHeight];

    const ctx = canvas.getContext('2d');
    ctx.drawImage(image.image, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);
    canvas.toBlob((blob) => {


      // [WIP]
      // call fileApi here, so the same as mobile and Justnote?


      _onSaveBtnClick(title, blob, image.fileName, image.fileType);
    }, image.fileType);
  };

  const onTitleInputChange = (e) => {
    dispatch(updateCustomEditor(e.target.value));
  }

  const onTitleInputKeyPress = (e) => {
    if (e.key === 'Enter') onSaveBtnClick();
  }

  const onUploadImageBtnClick = () => {
    uploadImageInput.current.click();
  };

  const onUploadImageInputChange = async () => {
    // For take photo on iOS Safari to work:
    //   1. The input must be actually appended to the DOM
    //   2. addEventListener must be used
    // https://stackoverflow.com/questions/47664777/javascript-file-input-onchange-not-working-ios-safari-only
    if (uploadImageInput.current.files) {
      const file = uploadImageInput.current.files[0];

      try {
        const data = await loadImage(
          file,
          {
            maxWidth: 1024 * 3, maxHeight: 1024 * 3,
            orientation: true, meta: true, canvas: true,
          },
        );
        dispatch(updateCustomEditor(
          null, { ...data, fileName: file.name, fileType: file.type }, 0, 0, 0, 0,
        ));
      } catch (e) {
        console.log(e);
        // TODO

      }
    }
  };

  const onClearImageBtnClick = () => {
    dispatch(updateCustomEditor(null, null, 0, 0, 0, 0, true));
  };

  const onZoomInputChange = (e) => {
    const zoom = parseInt(e.target.value, 10);
    dispatch(updateCustomEditor(null, null, null, null, null, zoom));
  };

  const onZoomInBtnClick = () => {
    let zoom = customEditor.zoom + 25;

    const maxZoom = parseInt(zoomInput.current.max, 10);
    if (zoom > maxZoom) zoom = maxZoom;

    dispatch(updateCustomEditor(null, null, null, null, null, zoom));
  };

  const onZoomOutBtnClick = () => {
    let zoom = customEditor.zoom - 25;

    const minZoom = parseInt(zoomInput.current.min, 10);
    if (zoom < minZoom) zoom = minZoom;

    dispatch(updateCustomEditor(null, null, null, null, null, zoom));
  };

  const onTouchMove = throttle((e) => {
    if (!isGrabbing.current) return;

    if (!Array.isArray(prevTouches.current)) {
      prevTouches.current = [...e.touches];
      return;
    }

    if (e.touches.length === 1 && prevTouches.current.length >= 1) {
      const touch = e.touches[0];
      const prevTouch = prevTouches.current[0];

      e.movementX = touch.pageX - prevTouch.pageX;
      e.movementY = touch.pageY - prevTouch.pageY;
      onMouseMove(e);
    } else if (e.touches.length === 2 && prevTouches.current.length >= 2) {
      const { image, translateX, translateY, zoom } = customEditor;

      const touch0 = e.touches[0];
      const touch1 = e.touches[1];
      const prevTouch0 = prevTouches.current[0];
      const prevTouch1 = prevTouches.current[1];

      const d0 = Math.sqrt(
        Math.pow(prevTouch1.pageX - prevTouch0.pageX, 2) +
        Math.pow(prevTouch1.pageY - prevTouch0.pageY, 2)
      );
      const d1 = Math.sqrt(
        Math.pow(touch1.pageX - touch0.pageX, 2) +
        Math.pow(touch1.pageY - touch0.pageY, 2)
      );
      const diff = d1 - d0;

      const maxZoom = parseInt(zoomInput.current.max, 10);
      const minZoom = parseInt(zoomInput.current.min, 10);

      let mZoom = zoom + diff;
      if (mZoom > maxZoom) mZoom = maxZoom;
      if (mZoom < minZoom) mZoom = minZoom;

      const imageAspectRatio = 7 / 12;
      const diffZoomRatio = ((mZoom / 50) + 1) - ((zoom / 50) + 1);

      const [cWidth, cHeight] = [cWidthRef.current, cHeightRef.current];

      let diffX, diffY;
      if (image.image.height / image.image.width < imageAspectRatio) {
        diffX = (image.image.width * cHeight / image.image.height) * diffZoomRatio / 2;
        diffY = cHeight * diffZoomRatio / 2;
      } else {
        diffX = cWidth * diffZoomRatio / 2;
        diffY = (image.image.height * cWidth / image.image.width) * diffZoomRatio / 2;
      }
      const mTranslateX = Math.max(translateX + diffX, 0);
      const mTranslateY = Math.max(translateY + diffY, 0);

      dispatch(updateCustomEditor(null, null, null, mTranslateX, mTranslateY, mZoom));
    }
    prevTouches.current = [...e.touches];
  }, 16);

  const onMouseMove = throttle((e) => {
    if (!isGrabbing.current) return;

    const dX = e.movementX * -1;
    const dY = e.movementY * -1;

    let tX = Math.round(customEditor.translateX + dX);
    let tY = Math.round(customEditor.translateY + dY);

    if (tX < 0) tX = 0;
    else if (tX > maxTranslateXRef.current) tX = maxTranslateXRef.current;

    if (tY < 0) tY = 0;
    else if (tY > maxTranslateYRef.current) tY = maxTranslateYRef.current;

    dispatch(updateCustomEditor(null, null, null, tX, tY));
  }, 16);

  const onMouseUp = () => {
    isGrabbing.current = false;
    prevTouches.current = null;
  };

  const onMouseLeave = () => {
    isGrabbing.current = false;
    prevTouches.current = null;
  };

  const onCanvasMouseDown = (e) => {
    isGrabbing.current = true;
  };

  const onCanvasDragStart = (e) => {
    // Need to prevent dragStart so mouseMove and mouseUp can work properly.
    e.preventDefault();
    return false;
  };

  useEffect(() => {
    if (isShown) {
      cancelBtn.current.focus();
      didClick.current = false;
    }
  }, [isShown]);

  useEffect(() => {
    if (!imageCanvas.current) return;

    const { image, translateX, translateY, zoom } = customEditor;
    if (!isObject(image)) {
      const ctx = imageCanvas.current.getContext('2d');
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      return;
    }

    let devicePixelRatio = 1;
    if (isNumber(window.devicePixelRatio)) devicePixelRatio = window.devicePixelRatio;

    const { width, height } = imageCanvas.current.getBoundingClientRect();
    if (
      imageCanvas.current.width !== width * devicePixelRatio ||
      imageCanvas.current.height !== height * devicePixelRatio
    ) {
      imageCanvas.current.width = width * devicePixelRatio;
      imageCanvas.current.height = height * devicePixelRatio;
    }

    const imageAspectRatio = 7 / 12;
    const zoomRatio = ((zoom / 50) + 1);

    let cWidth = width * 0.87;
    let cHeight = cWidth * imageAspectRatio;
    let cX = (width - cWidth) / 2;
    let cY = (height - cHeight) / 2;
    [cX, cY] = [Math.round(cX), Math.round(cY)];
    [cWidth, cHeight] = [Math.round(cWidth), Math.round(cHeight)];

    const [sX, sY, sWidth, sHeight] = [0, 0, image.image.width, image.image.height];

    const [dX, dY] = [cX - translateX, cY - translateY];

    // Cover image, find lesser width or height, make it with the same aspect ratio
    let dWidth, dHeight;
    if (image.image.height / image.image.width < imageAspectRatio) {
      dWidth = (image.image.width * cHeight / image.image.height) * zoomRatio;
      dHeight = (image.image.height * cHeight / image.image.height) * zoomRatio;
    } else {
      dWidth = (image.image.width * cWidth / image.image.width) * zoomRatio;
      dHeight = (image.image.height * cWidth / image.image.width) * zoomRatio;
    }
    [dWidth, dHeight] = [Math.round(dWidth), Math.round(dHeight)];

    const maxTranslateX = dWidth - cWidth;
    const maxTranslateY = dHeight - cHeight;
    if (translateX > maxTranslateX || translateY > maxTranslateY) {
      dispatch(updateCustomEditor(
        null, null, null,
        translateX > maxTranslateX ? maxTranslateX : null,
        translateY > maxTranslateY ? maxTranslateY : null,
      ));
      return;
    }

    const ctx = imageCanvas.current.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.scale(devicePixelRatio, devicePixelRatio);

    ctx.drawImage(image.image, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(0, 0, width, cY);
    ctx.fillRect(0, cY + cHeight, width, height - (cY + cHeight));
    ctx.fillRect(0, cY, cX, cHeight);
    ctx.fillRect(cX + cWidth, cY, width - (cX + cWidth), cHeight);

    [ctx.lineWidth, ctx.lineJoin, ctx.strokeStyle] = [4, 'round', '#2563eb'];
    ctx.strokeRect(cX, cY, cWidth, cHeight);

    cWidthRef.current = cWidth;
    cHeightRef.current = cHeight;
    maxTranslateXRef.current = maxTranslateX;
    maxTranslateYRef.current = maxTranslateY;
  });

  if (!isShown) return <AnimatePresence key="AnimatePresence_LEP" />;

  return (
    <AnimatePresence key="AnimatePresence_LEP">
      <div className={tailwind('fixed inset-0 z-30 overflow-hidden touch-none')}>
        <div onTouchMove={onTouchMove} onTouchEnd={onMouseUp} onTouchCancel={onMouseLeave} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseLeave} className={tailwind('flex items-center justify-center p-4')} style={{ minHeight: safeAreaHeight }}>
          <div className={tailwind('fixed inset-0')}>
            {/* No cancel on background of CustomEditorPopup */}
            <motion.button ref={cancelBtn} className={tailwind('absolute inset-0 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={dialogBgFMV} initial="hidden" animate="visible" exit="hidden" />
          </div>
          <motion.div className={tailwind('w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl')} variants={dialogFMV} initial="hidden" animate="visible" exit="hidden" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
            <div className={tailwind('relative flex flex-col overflow-hidden rounded-lg bg-white')}>
              <div className={tailwind('')}>
                <div className={tailwind('w-full aspect-w-12 aspect-h-8 bg-gray-200')}>
                  {/* aspect-ratio is padding-bottom underneath and this div is absolute inset-0 */}
                  <div>
                    {isString(customEditor.image) && <div className={tailwind('h-full w-full flex justify-center items-center')}>
                      <GracefulImage className={tailwind('w-full aspect-w-12 aspect-h-7 object-cover object-center ring-1 ring-black ring-opacity-5 blk:ring-0')} src={customEditor.image} />
                    </div>}
                    {isObject(customEditor.image) && <canvas ref={imageCanvas} onTouchStart={onCanvasMouseDown} onMouseDown={onCanvasMouseDown} onDragStart={onCanvasDragStart} className={tailwind('h-full w-full cursor-grab')}></canvas>}
                    {!customEditor.image && <Fragment>
                      <button onClick={onUploadImageBtnClick} type="button" className={tailwind('absolute top-1/2 left-1/2')}>
                        <svg className={tailwind('h-5 w-5 text-gray-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M4 3C3.46957 3 2.96086 3.21071 2.58579 3.58579C2.21071 3.96086 2 4.46957 2 5V15C2 15.5304 2.21071 16.0391 2.58579 16.4142C2.96086 16.7893 3.46957 17 4 17H16C16.5304 17 17.0391 16.7893 17.4142 16.4142C17.7893 16.0391 18 15.5304 18 15V5C18 4.46957 17.7893 3.96086 17.4142 3.58579C17.0391 3.21071 16.5304 3 16 3H4ZM16 15H4L8 7L11 13L13 9L16 15Z" />
                        </svg>
                        <span>Upload an image</span>
                      </button>
                      <input ref={uploadImageInput} onChange={onUploadImageInputChange} type="file" accept="image/*" className={tailwind('absolute top-full left-full')} />
                    </Fragment>}
                    {customEditor.image && <button onClick={onClearImageBtnClick} type="button" className={tailwind('absolute top-0 right-0 h-8 w-8')}>
                      <svg className={tailwind('h-5 w-5 text-gray-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.29303 4.293C4.48056 4.10553 4.73487 4.00021 5.00003 4.00021C5.26519 4.00021 5.5195 4.10553 5.70703 4.293L10 8.586L14.293 4.293C14.3853 4.19749 14.4956 4.12131 14.6176 4.0689C14.7396 4.01649 14.8709 3.9889 15.0036 3.98775C15.1364 3.9866 15.2681 4.0119 15.391 4.06218C15.5139 4.11246 15.6255 4.18671 15.7194 4.28061C15.8133 4.3745 15.8876 4.48615 15.9379 4.60905C15.9881 4.73194 16.0134 4.86362 16.0123 4.9964C16.0111 5.12918 15.9835 5.2604 15.9311 5.38241C15.8787 5.50441 15.8025 5.61475 15.707 5.707L11.414 10L15.707 14.293C15.8892 14.4816 15.99 14.7342 15.9877 14.9964C15.9854 15.2586 15.8803 15.5094 15.6948 15.6948C15.5094 15.8802 15.2586 15.9854 14.9964 15.9877C14.7342 15.99 14.4816 15.8892 14.293 15.707L10 11.414L5.70703 15.707C5.51843 15.8892 5.26583 15.99 5.00363 15.9877C4.74143 15.9854 4.49062 15.8802 4.30521 15.6948C4.1198 15.5094 4.01463 15.2586 4.01236 14.9964C4.01008 14.7342 4.11087 14.4816 4.29303 14.293L8.58603 10L4.29303 5.707C4.10556 5.51947 4.00024 5.26517 4.00024 5C4.00024 4.73484 4.10556 4.48053 4.29303 4.293Z" />
                      </svg>
                    </button>}
                  </div>
                </div>
                {isObject(customEditor.image) && <div className={tailwind('flex')}>
                  <button onClick={onZoomOutBtnClick} type="button" className={tailwind('flex items-center justify-center')}>
                    <svg className={tailwind('h-5 w-5 text-gray-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M8 4C6.93913 4 5.92172 4.42143 5.17157 5.17157C4.42143 5.92172 4 6.93913 4 8C4 9.06087 4.42143 10.0783 5.17157 10.8284C5.92172 11.5786 6.93913 12 8 12C9.06087 12 10.0783 11.5786 10.8284 10.8284C11.5786 10.0783 12 9.06087 12 8C12 6.93913 11.5786 5.92172 10.8284 5.17157C10.0783 4.42143 9.06087 4 8 4ZM2 8C1.99988 7.0557 2.22264 6.12471 2.65017 5.28274C3.0777 4.44077 3.69792 3.7116 4.4604 3.15453C5.22287 2.59745 6.10606 2.22821 7.03815 2.07683C7.97023 1.92545 8.92488 1.99621 9.82446 2.28335C10.724 2.57049 11.5432 3.0659 12.2152 3.7293C12.8872 4.39269 13.3931 5.20533 13.6919 6.10113C13.9906 6.99693 14.0737 7.95059 13.9343 8.88455C13.795 9.81851 13.4372 10.7064 12.89 11.476L17.707 16.293C17.8892 16.4816 17.99 16.7342 17.9877 16.9964C17.9854 17.2586 17.8802 17.5094 17.6948 17.6948C17.5094 17.8802 17.2586 17.9854 16.9964 17.9877C16.7342 17.99 16.4816 17.8892 16.293 17.707L11.477 12.891C10.5794 13.5293 9.52335 13.9082 8.42468 13.9861C7.326 14.0641 6.22707 13.8381 5.2483 13.333C4.26953 12.8278 3.44869 12.063 2.87572 11.1224C2.30276 10.1817 1.99979 9.10143 2 8Z" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M5 8C5 7.73478 5.10536 7.48043 5.29289 7.29289C5.48043 7.10536 5.73478 7 6 7H10C10.2652 7 10.5196 7.10536 10.7071 7.29289C10.8946 7.48043 11 7.73478 11 8C11 8.26522 10.8946 8.51957 10.7071 8.70711C10.5196 8.89464 10.2652 9 10 9H6C5.73478 9 5.48043 8.89464 5.29289 8.70711C5.10536 8.51957 5 8.26522 5 8Z" />
                    </svg>
                  </button>
                  <input ref={zoomInput} onChange={onZoomInputChange} type="range" value={customEditor.zoom} min={0} max={100} />
                  <button onClick={onZoomInBtnClick} type="button" className={tailwind('flex items-center justify-center')}>
                    <svg className={tailwind('h-5 w-5 text-gray-500')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 8C5 7.73478 5.10536 7.48043 5.29289 7.29289C5.48043 7.10536 5.73478 7 6 7H7V6C7 5.73478 7.10536 5.48043 7.29289 5.29289C7.48043 5.10536 7.73478 5 8 5C8.26522 5 8.51957 5.10536 8.70711 5.29289C8.89464 5.48043 9 5.73478 9 6V7H10C10.2652 7 10.5196 7.10536 10.7071 7.29289C10.8946 7.48043 11 7.73478 11 8C11 8.26522 10.8946 8.51957 10.7071 8.70711C10.5196 8.89464 10.2652 9 10 9H9V10C9 10.2652 8.89464 10.5196 8.70711 10.7071C8.51957 10.8946 8.26522 11 8 11C7.73478 11 7.48043 10.8946 7.29289 10.7071C7.10536 10.5196 7 10.2652 7 10V9H6C5.73478 9 5.48043 8.89464 5.29289 8.70711C5.10536 8.51957 5 8.26522 5 8Z" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M2 8C1.99988 7.0557 2.22264 6.12471 2.65017 5.28274C3.0777 4.44077 3.69792 3.7116 4.4604 3.15453C5.22287 2.59745 6.10606 2.22821 7.03815 2.07683C7.97023 1.92545 8.92488 1.99621 9.82446 2.28335C10.724 2.57049 11.5432 3.0659 12.2152 3.7293C12.8872 4.39269 13.3931 5.20533 13.6919 6.10113C13.9906 6.99693 14.0737 7.95059 13.9343 8.88455C13.795 9.81851 13.4372 10.7064 12.89 11.476L17.707 16.293C17.8892 16.4816 17.99 16.7342 17.9877 16.9964C17.9854 17.2586 17.8802 17.5094 17.6948 17.6948C17.5094 17.8802 17.2586 17.9854 16.9964 17.9877C16.7342 17.99 16.4816 17.8892 16.293 17.707L11.477 12.891C10.5794 13.5293 9.52335 13.9082 8.42468 13.9861C7.326 14.0641 6.22707 13.8381 5.2483 13.333C4.26953 12.8278 3.44869 12.063 2.87572 11.1224C2.30276 10.1817 1.99979 9.10143 2 8ZM8 4C6.93913 4 5.92172 4.42143 5.17157 5.17157C4.42143 5.92172 4 6.93913 4 8C4 9.06087 4.42143 10.0783 5.17157 10.8284C5.92172 11.5786 6.93913 12 8 12C9.06087 12 10.0783 11.5786 10.8284 10.8284C11.5786 10.0783 12 9.06087 12 8C12 6.93913 11.5786 5.92172 10.8284 5.17157C10.0783 4.42143 9.06087 4 8 4Z" />
                    </svg>
                  </button>
                </div>}
              </div>
              <div className={tailwind('')}>
                <input onChange={onTitleInputChange} onKeyPress={onTitleInputKeyPress} className={tailwind('w-full rounded-full border border-gray-400 bg-white px-3.5 py-1 text-base text-gray-700 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 blk:border-gray-600 blk:bg-gray-700 blk:text-gray-100 blk:placeholder:text-gray-400 blk:focus:border-transparent')} type="text" placeholder="Title" value={customEditor.title} autoCapitalize="none" autoFocus />
              </div>
              <div>
                <button onClick={onSaveBtnClick} type="button" className={tailwind('')}>Save</button>
                <button onClick={onPopupCloseBtnClick} type="button" className={tailwind('')}>Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      </div >
    </AnimatePresence>
  );
};

export default React.memo(CustomEditorPopup);
