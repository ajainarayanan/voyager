import * as React from 'react';
import * as vega from 'vega';
import * as vl from 'vega-lite';
import {Data, isInlineData, isNamedData} from 'vega-lite/build/src/data';
import {TopLevelExtendedSpec} from 'vega-lite/build/src/spec';
import * as vegaTooltip from 'vega-tooltip';
import {Logger} from '../util/util.logger';

export interface VegaLiteProps {
  spec: TopLevelExtendedSpec;

  renderer?: 'svg' | 'canvas';

  logger: Logger;

  data: Data;
}

const CHART_REF = 'chart';

export class VegaLite extends React.PureComponent<VegaLiteProps, {}> {
  private view: vega.View;
  private size: {width: number, height: number};

  public render() {
    return (
      <div>
        <div className='chart' ref={CHART_REF} style={{marginLeft: 'auto', marginRight: 'auto'}}/>
        <div id="vis-tooltip" className="vg-tooltip"/>
      </div>
    );
  }

  protected updateSpec() {
    // NOTE: spec used to test warning logger
    // vlSpec = {
    //   "description": "A simple bar chart with embedded data.",
    //   "data": {
    //     "values": [
    //       {"a": "A", "b": 28},
    //       {"a": "B", "b": 55},
    //       {"a": "C", "b": 43},
    //       {"a": "D", "b": 91},
    //       {"a": "E", "b": 81},
    //       {"a": "F", "b": 53},
    //       {"a": "G", "b": 19},
    //       {"a": "H", "b": 87},
    //       {"a": "I", "b": 52}
    //     ]
    //   },
    //   "mark": "bar",
    //   "encoding": {
    //     "x": {"field": "a", "type": "quantitative"},
    //     "y": {"field": "b", "type": "quantitative"}
    //   }
    // };
    const {logger} = this.props;
    const vlSpec = this.props.spec;
    try {
      const spec = vl.compile(vlSpec, logger).spec;
      const runtime = vega.parse(spec, vlSpec.config);
      this.view = new vega.View(runtime)
        .logLevel(vega.Warn)
        .initialize(this.refs[CHART_REF] as any)
        .renderer(this.props.renderer || 'svg')
        .hover();
      vegaTooltip.vega(this.view);
      this.bindData();
    } catch (err) {
      logger.error(err);
    }
  }

  protected componentDidMount() {
    this.updateSpec();
    this.runView();
  }

  protected componentWillUpdate() {
    this.size = this.getChartSize();
  }

  protected componentDidUpdate(prevProps: VegaLiteProps, prevState: {}) {
    if (prevProps.spec !== this.props.spec) {
      const chart = this.refs[CHART_REF] as HTMLElement;
      chart.style.width = this.size.width + 'px';
      chart.style.height = (this.size.height + 3) + 'px';
      // add extra 3px to height so chart can contain the svg/canvas plot
      this.updateSpec();
    } else if (prevProps.data !== this.props.data) {
      this.bindData();
    }
    this.runView();
  }

  private bindData() {
    const {data, spec} = this.props;
    if (isInlineData(data) && isNamedData(spec.data) && !this.view.data(spec.data.name)) {
      this.view.change(spec.data.name,
        vega.changeset()
            .remove(() => true) // remove previous data
            .insert(data.values)
      );
    }
  }

  private runView() {
    setTimeout(() => {
      try {
        this.view.run();
      } catch (err) {
        this.props.logger.error(err);
      }
    });
  }

  private getChartSize(): {width: number, height: number} {
    const chart = this.refs[CHART_REF] as HTMLElement;
    const svg = chart.querySelector(this.props.renderer || 'svg');
    const width = Number(svg.getAttribute('width'));
    const height = Number(svg.getAttribute('height'));
    return {width, height};
  }
}
