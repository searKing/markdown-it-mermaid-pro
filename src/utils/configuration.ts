import { defaults } from 'lodash';
import './utils/json';
// export type JSON = IDefaultOptions;

export interface IDefaultOptions {
  cb?: any;
  contentMaps?: string[];
  debug?: boolean;
  renderer?: any;
  rootWebPath?: string;
}
