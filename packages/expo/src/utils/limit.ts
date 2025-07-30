import { sleep, sample } from '../utils';

export const getLimiter = (limit) => {
  let networkInfos = []; // info = { rId, dt, nRequests }

  const respectLimit = async (rId, nRequests) => {
    const LIMIT = limit; // Requests per minute
    const ONE_MINUTE = 60 * 1000;
    const N_TRIES = 4;

    let result = false;
    for (let currentTry = 1; currentTry <= N_TRIES; currentTry++) {
      networkInfos = networkInfos.filter(info => info.dt >= Date.now() - ONE_MINUTE);

      let tReqs = 0, tDT = Date.now(), doExceed = false;
      for (let i = networkInfos.length - 1; i >= 0; i--) {
        const info = networkInfos[i];
        if (info.nRequests + tReqs >= LIMIT) {
          doExceed = true;
          break;
        }

        tReqs += info.nRequests;
        tDT = info.dt;
      }
      if (!doExceed) {
        updateNetworkInfos(rId, nRequests);
        result = true;
        break;
      }
      if (currentTry < N_TRIES) {
        const frac = sample([1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000]);
        let duration = ONE_MINUTE - (Date.now() - tDT) + frac;
        if (duration < 0) duration = 0;
        if (duration > ONE_MINUTE + frac) duration = ONE_MINUTE + frac;
        await sleep(duration);
      }
    }
    return result;
  };

  const updateNetworkInfos = (rId, nRequests) => {
    for (const info of networkInfos) {
      if (info.rId === rId) {
        [info.dt, info.nRequests] = [Date.now(), nRequests];
        return;
      }
    }

    networkInfos.push({ rId, dt: Date.now(), nRequests });
  };

  return { respectLimit, updateNetworkInfos };
};
