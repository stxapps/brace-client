import React from 'react';

class Footer extends React.PureComponent {

  render() {
    return (
      <footer className="mx-auto px-4 pt-28 pb-6 max-w-6xl md:px-6 lg:px-8">
        <div className="text-left md:text-center">
          <a className="block text-base text-gray-500 rounded-sm hover:text-gray-900 focus:outline-none focus:ring md:inline md:mr-10" href="/#about">About</a>
          <a className="mt-4 block text-base text-gray-500 rounded-sm hover:text-gray-900 focus:outline-none focus:ring md:inline md:mt-0 md:mr-10" href="/#terms">Terms</a>
          <a className="mt-4 block text-base text-gray-500 rounded-sm hover:text-gray-900 focus:outline-none focus:ring md:inline md:mt-0 md:mr-10" href="/#privacy">Privacy</a>
          <a className="mt-4 block text-base text-gray-500 rounded-sm hover:text-gray-900 focus:outline-none focus:ring md:inline md:mt-0" href="/#support">Support</a>
        </div>
        <div className="pt-6 flex justify-start items-center md:justify-center">
          <a className="rounded focus:outline-none focus:ring" href="https://twitter.com/bracedotto">
            <svg className="my-0.5 w-8 text-gray-400 hover:text-gray-500" viewBox="0 0 40 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M39.3698 3.78614C37.8984 4.44222 36.3353 4.8694 34.7347 5.05288C36.4236 4.04791 37.6878 2.46123 38.2902 0.59049C36.7003 1.529 34.9626 2.19096 33.1512 2.54819C32.0432 1.36791 30.6059 0.547927 29.0261 0.194638C27.4462 -0.158651 25.7966 -0.028933 24.2913 0.566959C22.7861 1.16285 21.4947 2.19741 20.5847 3.53637C19.6747 4.87533 19.1882 6.45689 19.1883 8.0758C19.1864 8.69639 19.2589 9.31498 19.4042 9.91833C16.1925 9.75558 13.0507 8.92071 10.1818 7.46769C7.31299 6.01467 4.78096 3.97583 2.74941 1.48297C1.71591 3.26124 1.39962 5.36677 1.86504 7.37021C2.33046 9.37365 3.54253 11.1241 5.25411 12.2647C3.9726 12.224 2.71923 11.8786 1.59782 11.2571V11.3578C1.59779 13.2224 2.24286 15.0295 3.42355 16.4726C4.60425 17.9156 6.24786 18.9058 8.07549 19.275C7.38151 19.4662 6.66491 19.5631 5.94506 19.5629C5.43327 19.5584 4.92279 19.5103 4.41921 19.4189C4.93557 21.0235 5.93989 22.4268 7.29207 23.4332C8.64425 24.4396 10.2768 24.9988 11.9621 25.0329C9.0986 27.2749 5.5657 28.4914 1.9289 28.4877C1.28428 28.4856 0.640289 28.4471 0 28.3725C3.69278 30.7449 7.99038 32.0042 12.3795 32C27.235 32 35.3537 19.6924 35.3537 9.02586C35.3537 8.68038 35.3393 8.32051 35.3249 7.97503C36.9116 6.83045 38.2814 5.41192 39.3698 3.78614Z" />
            </svg>
          </a>
          <a className="ml-6 rounded focus:outline-none focus:ring" href="https://github.com/bracedotto">
            <svg className="w-8 text-gray-400 hover:text-gray-500" viewBox="0 0 33 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.3972 0C14.2439 0 12.1117 0.424127 10.1223 1.24817C8.13288 2.0722 6.32526 3.28001 4.80264 4.80264C1.72756 7.87772 0 12.0484 0 16.3972C0 23.6448 4.70601 29.7938 11.2157 31.9746C12.0356 32.1058 12.2979 31.5975 12.2979 31.1547V28.3836C7.75589 29.3674 6.78845 26.1864 6.78845 26.1864C6.03418 24.2843 4.96836 23.776 4.96836 23.776C3.47621 22.7594 5.08314 22.7922 5.08314 22.7922C6.72287 22.9069 7.59192 24.4811 7.59192 24.4811C9.01848 26.9734 11.4289 26.2356 12.3635 25.842C12.5111 24.7762 12.9374 24.0547 13.3965 23.6448C9.75635 23.2349 5.9358 21.8247 5.9358 15.5774C5.9358 13.7573 6.55889 12.2979 7.62471 11.1337C7.46074 10.7238 6.88684 9.01848 7.78869 6.80485C7.78869 6.80485 9.16605 6.36213 12.2979 8.47737C13.5933 8.11663 15.0035 7.93626 16.3972 7.93626C17.791 7.93626 19.2012 8.11663 20.4965 8.47737C23.6284 6.36213 25.0058 6.80485 25.0058 6.80485C25.9076 9.01848 25.3337 10.7238 25.1698 11.1337C26.2356 12.2979 26.8587 13.7573 26.8587 15.5774C26.8587 21.8411 23.0217 23.2185 19.3651 23.6284C19.9554 24.1367 20.4965 25.137 20.4965 26.6619V31.1547C20.4965 31.5975 20.7589 32.1222 21.5952 31.9746C28.1049 29.7774 32.7945 23.6448 32.7945 16.3972C32.7945 14.2439 32.3703 12.1117 31.5463 10.1223C30.7223 8.13288 29.5145 6.32526 27.9918 4.80264C26.4692 3.28001 24.6616 2.0722 22.6722 1.24817C20.6828 0.424127 18.5505 0 16.3972 0Z" />
            </svg>
          </a>
        </div>
        <div className="pt-16 md:flex md:justify-between">
          <p className="text-base text-gray-400 text-left">©2021 Brace.to</p>
          <p className="text-base text-gray-400 text-left">Crafted with ❤ and ℅ in Bangkok</p>
        </div>
      </footer>

    );
  }
}

export default Footer;
