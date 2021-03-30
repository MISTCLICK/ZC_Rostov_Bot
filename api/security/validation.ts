import { allowedSources } from './cfg.json';
import authorizationScript from '../schema/authenticationScript';

export default async function validate(key: string, source: string) {
  let factor = false;

  let tokenWritten = await authorizationScript.findOne({
    token: key
  });

  if (tokenWritten && tokenWritten.allowedSource === source && tokenWritten.active && allowedSources.find(s => s === source) ? true : false) factor = true;

  return factor;
}