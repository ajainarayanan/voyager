import {FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';
export interface VoyagerConfig {
  showDataSourceSelector?: boolean;
  serverUrl?: string | null;
  manualSpecificationOnly?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
  vegaPlotSpec?: FacetedCompositeUnitSpec;
};

export const DEFAULT_VOYAGER_CONFIG: VoyagerConfig = {
  showDataSourceSelector: true,
  serverUrl: null,
  manualSpecificationOnly: false,
  hideHeader: false,
  hideFooter: false,
  vegaPlotSpec: {}
};
