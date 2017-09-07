
import * as React from 'react';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {connect} from 'react-redux';
import {ClipLoader} from 'react-spinners';
import * as SplitPane from 'react-split-pane';
import '../../../components/app.scss';
import {DataPane} from '../../../components/data-pane/index';
import {EncodingPane} from '../../../components/encoding-pane/index';
import {LoadData} from '../../../components/load-data-pane/index';
import {LogPane} from '../../../components/log-pane/index';
import {ViewPane} from '../../../components/view-pane/index';
import {SPINNER_COLOR} from '../../../constants';
import {VoyagerConfig} from '../../../models/config';
import {Dataset} from '../../../models/dataset';
import {State} from '../../../models/index';
import {selectConfig} from '../../../selectors';
import {selectDataset} from '../../../selectors/dataset';

export interface AppRootProps {
  dataset: Dataset;
  config: VoyagerConfig;
}

class AppRootBase extends React.PureComponent<AppRootProps, {}> {
  public render() {
    const {dataset} = this.props;
    let bottomPane;
    if (!dataset.isLoading) {
      if (!dataset.data) {
        bottomPane = <LoadData/>;
      } else {
        bottomPane = (
          <SplitPane split="vertical" defaultSize={200}>
            <DataPane/>
            <SplitPane split="vertical" defaultSize={235}>
              <EncodingPane/>
              <ViewPane/>
            </SplitPane>
          </SplitPane>
        );
      }
    }
    return (
      <div className="voyager">
        <LogPane/>
        <ClipLoader color={SPINNER_COLOR} loading={dataset.isLoading}/>
        {bottomPane}
      </div>
    );
  }
}

export const AppRoot = connect(
  (state: State) => {
    return {
      dataset: selectDataset(state),
      config: selectConfig(state)
    };
  }
)(DragDropContext(HTML5Backend)(AppRootBase));

