import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import loadImage from 'blueimp-load-image';

import { useSelector, useDispatch } from '../store';
import fileApi from '../apis/localFile';
import { updatePopup } from '../actions';
import { updateCustomEditor, updateImages, updateCustomData } from '../actions/chunk';
import { CUSTOM_EDITOR_POPUP, IMAGES, CD_ROOT, BLK_MODE } from '../types/const';
import { getCustomEditor, getThemeMode } from '../selectors';
import {
  isObject, isString, isNumber, throttle, randomString, getFileExt, getMainId,
} from '../utils';
import { dialogBgFMV, dialogFMV } from '../types/animConfigs';

import { useSafeAreaFrame, useSafeAreaInsets, useTailwind } from '.';

const CustomEditorPopup = () => {
  // Use windowHeight to move along with a virtual keyboard.
  const { windowHeight } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const isShown = useSelector(state => state.display.isCustomEditorPopupShown);
  const selectingLinkId = useSelector(state => state.display.selectingLinkId);
  const customEditor = useSelector(state => getCustomEditor(state));
  const themeMode = useSelector(state => getThemeMode(state));
  const cancelBtn = useRef(null);
  const scrollPanel = useRef(null);
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

  const rotateImage = (canvas, rotate) => {
    if (![90, 180, 270].includes(rotate)) return canvas;

    let rWidth = canvas.width, rHeight = canvas.height, rTranslateX = 0, rTranslateY = 0;
    if (rotate === 90) {
      [rWidth, rHeight] = [canvas.height, canvas.width];
      [rTranslateX, rTranslateY] = [rWidth, 0];
    } else if (rotate === 180) {
      [rWidth, rHeight] = [canvas.width, canvas.height];
      [rTranslateX, rTranslateY] = [rWidth, rHeight];
    } else if (rotate === 270) {
      [rWidth, rHeight] = [canvas.height, canvas.width];
      [rTranslateX, rTranslateY] = [0, rHeight];
    }

    const rCanvas = /* @type HTMLCanvasElement */(document.createElement('canvas'));
    [rCanvas.width, rCanvas.height] = [rWidth, rHeight];

    const ctx = rCanvas.getContext('2d');
    ctx.translate(rTranslateX, rTranslateY);
    ctx.rotate(rotate * Math.PI / 180);
    ctx.drawImage(
      canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height,
    );
    ctx.rotate(-1 * rotate * Math.PI / 180);
    ctx.translate(-1 * rTranslateX, -1 * rTranslateY);

    return rCanvas;
  };

  const onPopupCloseBtnClick = () => {
    if (didClick.current) return;
    dispatch(updatePopup(CUSTOM_EDITOR_POPUP, false));
    didClick.current = true;
  };

  const onCanvasToBlob = async (blob) => {
    const { title, image } = customEditor;

    const toId = `${getMainId(selectingLinkId)}-${randomString(4)}-${Date.now()}`;
    let fpart = IMAGES + '/' + toId;
    const ext = getFileExt(image.fileName);
    if (ext) fpart += `.${ext}`;

    const cfpart = CD_ROOT + '/' + fpart;
    try {
      // Call fileApi here,
      //   1. the same as mobile and Justnote.
      //   2. UPDATE_CUSTOM_DATA is used in retryDiedlinks
      //        and at that time, there is no res from putFile like here.
      //   3. Need image objectUrl to display the image right away,
      //        not after the commit.
      const { contentUrl } = await fileApi.putFile(fpart, blob);
      dispatch(updateImages(cfpart, contentUrl));

      dispatch(updatePopup(CUSTOM_EDITOR_POPUP, false));
      dispatch(updateCustomData(title, cfpart));
    } catch (error) {
      console.log('CustomEditorPopup: onCanvasToBlob error: ', error);
      dispatch(updateCustomEditor(
        null, null, null, null, null, null, null, `Image Save Failed: ${error}`,
      ));
      didClick.current = false;
    }
  };

  const onSaveBtnClick = () => {
    if (didClick.current) return;
    didClick.current = true;

    const { title, image, rotate, translateX, translateY, zoom } = customEditor;

    if (!isObject(image)) {
      dispatch(updatePopup(CUSTOM_EDITOR_POPUP, false));
      dispatch(updateCustomData(title, image));
      return;
    }

    const imageAspectRatio = 7 / 12;
    const zoomRatio = ((zoom / 50) + 1);

    const [cWidth, cHeight] = [cWidthRef.current, cHeightRef.current];

    const rotatedImage = rotateImage(image.image, rotate);

    let sX, sY, sWidth, sHeight;
    if (rotatedImage.height / rotatedImage.width < imageAspectRatio) {
      sX = (translateX / zoomRatio) * rotatedImage.height / cHeight;
      sY = (translateY / zoomRatio) * rotatedImage.height / cHeight;
      sWidth = (cWidth / zoomRatio) * rotatedImage.height / cHeight;
      sHeight = (cHeight / zoomRatio) * rotatedImage.height / cHeight;
    } else {
      sX = (translateX / zoomRatio) * rotatedImage.width / cWidth;
      sY = (translateY / zoomRatio) * rotatedImage.width / cWidth;
      sWidth = (cWidth / zoomRatio) * rotatedImage.width / cWidth;
      sHeight = (cHeight / zoomRatio) * rotatedImage.width / cWidth;
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
    ctx.drawImage(rotatedImage, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);
    canvas.toBlob(onCanvasToBlob, image.fileType);
  };

  const onTitleInputChange = (e) => {
    dispatch(updateCustomEditor(e.target.value));
  };

  const onTitleInputKeyPress = (e) => {
    if (e.key === 'Enter') onSaveBtnClick();
  };

  const onUploadImageBtnClick = () => {
    if (uploadImageInput.current) uploadImageInput.current.click();
  };

  const onUploadImageInputChange = async () => {
    // For take photo on iOS Safari to work:
    //   1. The input must be actually appended to the DOM
    //   2. addEventListener must be used
    // https://stackoverflow.com/questions/47664777/javascript-file-input-onchange-not-working-ios-safari-only
    if (uploadImageInput.current && uploadImageInput.current.files) {
      const file = uploadImageInput.current.files[0];
      try {
        const data = await loadImage(file, {
          maxWidth: 1024 * 3, maxHeight: 1024 * 3,
          orientation: true, meta: true, canvas: true,
        });
        dispatch(updateCustomEditor(
          null, { ...data, fileName: file.name, fileType: file.type }, 0, 0, 0, 0,
        ));
      } catch (error) {
        console.log('CustomEditorPopup: onUploadImageInputChange error: ', error);
        dispatch(updateCustomEditor(
          null, null, null, null, null, null, null, `Image Upload Failed: ${error}`,
        ));
      }
    }
  };

  const onClearImageBtnClick = () => {
    dispatch(updateCustomEditor(null, null, 0, 0, 0, 0, true));
  };

  const onRotateRightBtnClick = () => {
    let rotate = customEditor.rotate;
    if (rotate >= 270) rotate = 0;
    else if (rotate >= 180) rotate = 270;
    else if (rotate >= 90) rotate = 180;
    else rotate = 90;
    dispatch(updateCustomEditor(null, null, rotate, 0, 0, 0));
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
      const { image, rotate, translateX, translateY, zoom } = customEditor;

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
      const zoomRatio = ((mZoom / 50) + 1) - ((zoom / 50) + 1);

      const [cWidth, cHeight] = [cWidthRef.current, cHeightRef.current];

      const rotatedImage = rotateImage(image.image, rotate);

      let diffX, diffY;
      if (rotatedImage.height / rotatedImage.width < imageAspectRatio) {
        diffX = (rotatedImage.width * cHeight / rotatedImage.height) * zoomRatio / 2;
        diffY = (rotatedImage.height * cHeight / rotatedImage.height) * zoomRatio / 2;
      } else {
        diffX = (rotatedImage.width * cWidth / rotatedImage.width) * zoomRatio / 2;
        diffY = (rotatedImage.height * cWidth / rotatedImage.width) * zoomRatio / 2;
      }
      const mTranslateX = Math.max(translateX + diffX, 0);
      const mTranslateY = Math.max(translateY + diffY, 0);

      dispatch(updateCustomEditor(null, null, null, mTranslateX, mTranslateY, mZoom));
    }
    prevTouches.current = [...e.touches];
  }, 16);

  const onMouseMove: (e: any) => void = throttle((e) => {
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

    const { image, rotate, translateX, translateY, zoom } = customEditor;
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

    const rotatedImage = rotateImage(image.image, rotate);

    const [sX, sY, sWidth, sHeight] = [0, 0, rotatedImage.width, rotatedImage.height];

    const [dX, dY] = [cX - translateX, cY - translateY];

    // Cover image, find lesser width or height, make it with the same aspect ratio
    let dWidth, dHeight;
    if (rotatedImage.height / rotatedImage.width < imageAspectRatio) {
      dWidth = (rotatedImage.width * cHeight / rotatedImage.height) * zoomRatio;
      dHeight = (rotatedImage.height * cHeight / rotatedImage.height) * zoomRatio;
    } else {
      dWidth = (rotatedImage.width * cWidth / rotatedImage.width) * zoomRatio;
      dHeight = (rotatedImage.height * cWidth / rotatedImage.width) * zoomRatio;
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
    ctx.resetTransform();
    ctx.scale(devicePixelRatio, devicePixelRatio);

    ctx.drawImage(rotatedImage, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);

    if (themeMode === BLK_MODE) ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    else ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
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

  const canvasStyle = {
    paddingTop: insets.top, paddingBottom: insets.bottom,
    paddingLeft: insets.left, paddingRight: insets.right,
  };
  const panelHeight = Math.min(480, windowHeight * 0.9);
  const zoomRangeStyle = { backgroundSize: `${customEditor.zoom}% 100%` };

  return (
    <AnimatePresence key="AnimatePresence_LEP">
      <div style={canvasStyle} className={tailwind('fixed inset-0 z-30 touch-none overflow-hidden')}>
        <div onTouchMove={onTouchMove} onTouchEnd={onMouseUp} onTouchCancel={onMouseLeave} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseLeave} className={tailwind('flex items-center justify-center p-4')} style={{ minHeight: windowHeight }}>
          <div className={tailwind('fixed inset-0')}>
            {/* No cancel on background of CustomEditorPopup */}
            <motion.button ref={cancelBtn} className={tailwind('absolute inset-0 h-full w-full cursor-default bg-black bg-opacity-25 focus:outline-none')} variants={dialogBgFMV} initial="hidden" animate="visible" exit="hidden" />
          </div>
          <motion.div className={tailwind('w-full max-w-sm overflow-hidden rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 blk:ring-white blk:ring-opacity-25')} variants={dialogFMV} initial="hidden" animate="visible" exit="hidden" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
            <div ref={scrollPanel} style={{ maxHeight: panelHeight }} className={tailwind('relative flex flex-col overflow-y-auto overflow-x-hidden rounded-lg bg-white blk:bg-gray-800')}>
              {isString(customEditor.image) && <div className={tailwind('aspect-w-12 aspect-h-7 w-full')}>
                <div>
                  <Image className={tailwind('h-full w-full object-cover object-center ring-1 ring-black ring-opacity-5 blk:ring-0')} src={customEditor.imageUrl} alt="Custom link's illustration" />
                  <button onClick={onClearImageBtnClick} className={tailwind('group absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center focus:outline-none')} type="button" title="Remove">
                    <div className={tailwind('flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 group-focus:ring blk:bg-gray-700')}>
                      <svg className={tailwind('h-4 w-4 text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-200')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>}
              {!customEditor.image && <div className={tailwind('aspect-w-12 aspect-h-7 w-full')}>
                {/* aspect-ratio is padding-bottom underneath and this div is absolute inset-0 */}
                <div className={tailwind('flex items-center justify-center bg-white ring-1 ring-black ring-opacity-5 blk:bg-gray-800 blk:ring-1 blk:ring-white blk:ring-opacity-10')}>
                  <button onClick={onUploadImageBtnClick} className={tailwind('group mt-4 flex flex-col items-center justify-center rounded-lg p-2 focus:outline-none focus:ring')} type="button" title="Upload">
                    <svg className={tailwind('h-9 w-9 text-gray-400 group-hover:text-gray-500 blk:text-gray-400 blk:group-hover:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M4 3C3.46957 3 2.96086 3.21071 2.58579 3.58579C2.21071 3.96086 2 4.46957 2 5V15C2 15.5304 2.21071 16.0391 2.58579 16.4142C2.96086 16.7893 3.46957 17 4 17H16C16.5304 17 17.0391 16.7893 17.4142 16.4142C17.7893 16.0391 18 15.5304 18 15V5C18 4.46957 17.7893 3.96086 17.4142 3.58579C17.0391 3.21071 16.5304 3 16 3H4ZM16 15H4L8 7L11 13L13 9L16 15Z" />
                    </svg>
                    <span className={tailwind('mt-1 text-sm text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-200')}>Upload an image</span>
                  </button>
                  <input ref={uploadImageInput} onChange={onUploadImageInputChange} className={tailwind('absolute top-full left-full')} tabIndex={-1} type="file" accept="image/*" />
                </div>
              </div>}
              {isObject(customEditor.image) && <React.Fragment>
                <div className={tailwind('aspect-w-12 aspect-h-8 w-full bg-gray-100 blk:bg-gray-700')}>
                  {/* aspect-ratio is padding-bottom underneath and this div is absolute inset-0 */}
                  <div className={tailwind('flex items-center justify-center')}>
                    <canvas ref={imageCanvas} onTouchStart={onCanvasMouseDown} onMouseDown={onCanvasMouseDown} onDragStart={onCanvasDragStart} className={tailwind('h-full w-full cursor-grab touch-none overflow-hidden rounded-t-lg')}></canvas>
                  </div>
                </div>
                <div className={tailwind('flex items-center justify-end px-1')}>
                  <button onClick={onRotateRightBtnClick} className={tailwind('group flex h-10 w-10 items-center justify-center focus:outline-none')} type="button" title="Rotate">
                    <div className={tailwind('rounded p-1 group-focus:ring')}>
                      <svg className={tailwind('h-5 w-5 text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-200')} viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.9146 18.2881C15.5158 19.3742 13.7961 19.9655 12.0251 19.9693C10.2541 19.9731 8.53188 19.3893 7.12834 18.3092C5.72481 17.2291 4.71929 15.7139 4.26936 14.001C3.81942 12.2882 3.95051 10.4744 4.64208 8.844M19.9993 3.98956V8.98956H19.4183M19.4183 8.98956C18.7535 7.34866 17.5634 5.97452 16.0342 5.08227C14.505 4.19002 12.7231 3.83004 10.9674 4.05869C9.21179 4.28733 7.58153 5.09169 6.33186 6.34584C5.0822 7.59998 4.28369 9.23312 4.06133 10.9896M19.4183 8.98956H14.9993" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>
                  <button onClick={onZoomOutBtnClick} className={tailwind('group flex h-10 w-10 items-center justify-center focus:outline-none')} type="button" title="Zoom out">
                    <div className={tailwind('rounded p-1 group-focus:ring')}>
                      <svg className={tailwind('h-5 w-5 text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-200')} viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 10H7M21 21L15 15L21 21ZM17 10C17 10.9193 16.8189 11.8295 16.4672 12.6788C16.1154 13.5281 15.5998 14.2997 14.9497 14.9497C14.2997 15.5998 13.5281 16.1154 12.6788 16.4672C11.8295 16.8189 10.9193 17 10 17C9.08075 17 8.1705 16.8189 7.32122 16.4672C6.47194 16.1154 5.70026 15.5998 5.05025 14.9497C4.40024 14.2997 3.88463 13.5281 3.53284 12.6788C3.18106 11.8295 3 10.9193 3 10C3 8.14348 3.7375 6.36301 5.05025 5.05025C6.36301 3.7375 8.14348 3 10 3C11.8565 3 13.637 3.7375 14.9497 5.05025C16.2625 6.36301 17 8.14348 17 10Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>
                  <input ref={zoomInput} onChange={onZoomInputChange} style={zoomRangeStyle} className={tailwind('zoom-range blk:zoom-range-blk')} type="range" value={customEditor.zoom} min={0} max={100} />
                  <button onClick={onZoomInBtnClick} className={tailwind('group flex h-10 w-10 items-center justify-center focus:outline-none')} type="button" title="Zoom in">
                    <div className={tailwind('rounded p-1 group-focus:ring')}>
                      <svg className={tailwind('h-5 w-5 text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-200')} viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 10H7M21 21L15 15L21 21ZM17 10C17 10.9193 16.8189 11.8295 16.4672 12.6788C16.1154 13.5281 15.5998 14.2997 14.9497 14.9497C14.2997 15.5998 13.5281 16.1154 12.6788 16.4672C11.8295 16.8189 10.9193 17 10 17C9.08075 17 8.1705 16.8189 7.32122 16.4672C6.47194 16.1154 5.70026 15.5998 5.05025 14.9497C4.40024 14.2997 3.88463 13.5281 3.53284 12.6788C3.18106 11.8295 3 10.9193 3 10C3 8.14348 3.7375 6.36301 5.05025 5.05025C6.36301 3.7375 8.14348 3 10 3C11.8565 3 13.637 3.7375 14.9497 5.05025C16.2625 6.36301 17 8.14348 17 10ZM10 7V10V7ZM10 10V13V10ZM10 10H13H10Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>
                  <button onClick={onClearImageBtnClick} className={tailwind('group flex h-10 w-10 items-center justify-center focus:outline-none')} type="button" title="Remove">
                    <div className={tailwind('rounded p-1 group-focus:ring')}>
                      <svg className={tailwind('h-5 w-5 text-gray-500 group-hover:text-gray-600 blk:text-gray-300 blk:group-hover:text-gray-200')} viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 11V17M14 11V17M4 7H20M19 7L18.133 19.142C18.0971 19.6466 17.8713 20.1188 17.5011 20.4636C17.1309 20.8083 16.6439 21 16.138 21H7.862C7.35614 21 6.86907 20.8083 6.49889 20.4636C6.1287 20.1188 5.90292 19.6466 5.867 19.142L5 7H19ZM15 7V4C15 3.73478 14.8946 3.48043 14.7071 3.29289C14.5196 3.10536 14.2652 3 14 3H10C9.73478 3 9.48043 3.10536 9.29289 3.29289C9.10536 3.48043 9 3.73478 9 4V7H15Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>
                </div>
              </React.Fragment>}
              <div className={tailwind(`flex px-4 ${isObject(customEditor.image) ? 'pt-2' : 'pt-4'}`)}>
                <span className={tailwind('inline-flex items-center text-sm text-gray-500 blk:text-gray-300')}>Title:</span>
                <div className={tailwind('ml-3 flex-1')}>
                  <input onChange={onTitleInputChange} onKeyDown={onTitleInputKeyPress} className={tailwind('w-full rounded-full border border-gray-400 bg-white px-3.5 py-1 text-base text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 blk:border-gray-600 blk:bg-gray-700 blk:text-gray-100 blk:placeholder:text-gray-500 blk:focus:border-transparent')} type="text" placeholder="Title" value={customEditor.title} />
                </div>
              </div>
              <div className={tailwind('px-4 pt-3 pb-4')}>
                <button onClick={onSaveBtnClick} style={{ paddingTop: '0.4375rem', paddingBottom: '0.4375rem' }} className={tailwind('rounded-full bg-gray-800 px-4 text-sm font-medium text-gray-50 hover:bg-gray-900 focus:outline-none focus:ring blk:bg-gray-100 blk:text-gray-800 blk:hover:bg-white')} type="button">Save</button>
                <button onClick={onPopupCloseBtnClick} className={tailwind('ml-2 rounded-md px-2.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring focus:ring-inset blk:text-gray-300 blk:hover:bg-gray-700')} type="button">Cancel</button>
              </div>
              {customEditor.msg.length > 0 && <div className={tailwind('absolute inset-x-0 top-0 flex items-start justify-center')}>
                <div className={tailwind('m-4 rounded-md bg-red-50 p-4 shadow')}>
                  <div className={tailwind('flex')}>
                    <div className={tailwind('flex-shrink-0')}>
                      <svg className={tailwind('h-6 w-6 text-red-400')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className={tailwind('ml-3 mt-0.5')}>
                      <h3 className={tailwind('text-left text-sm leading-5 text-red-800 line-clamp-2')}>{customEditor.msg}</h3>
                    </div>
                  </div>
                </div>
              </div>}
            </div>
          </motion.div>
        </div>
      </div >
    </AnimatePresence>
  );
};

export default React.memo(CustomEditorPopup);
