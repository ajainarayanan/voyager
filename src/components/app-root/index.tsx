
import * as React from 'react';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {connect} from 'react-redux';
import * as SplitPane from 'react-split-pane';
import {Data} from 'vega-lite/build/src/data';
import {State} from '../../models/index';
import {selectData} from '../../selectors/dataset';
import {DataPane} from '../data-pane/index';
import {EncodingPane} from '../encoding-pane/index';
import {Header} from '../header/index';
import {LoadData} from '../load-data-pane/index';
import {ViewPane} from '../view-pane/index';

export interface AppRootProps {
  data: Data;
}

class AppRootBase extends React.PureComponent<AppRootProps, {}> {
  public render() {
    let bottomPane;
    if (!this.props.data) {
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
    return (
      <div className="voyager">
        <Header/>
        {bottomPane}
      </div>
    );
  }
}

export const AppRoot = connect(
  (state: State) => {
    return {
      data: selectData(state)
    };
  }
)(DragDropContext(HTML5Backend)(AppRootBase));

