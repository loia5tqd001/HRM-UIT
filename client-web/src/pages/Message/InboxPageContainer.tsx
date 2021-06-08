import * as React from 'react';

import type Talk from 'talkjs';
import * as talkSession from './talk-session';
import { destroyAllPopups } from './talk.util';
import Inbox from './Inbox/Inbox';

interface DefaultProps {}

interface DefaultState {
  talkSession: Talk.Session | null;
}

class InboxPageContainer extends React.Component<DefaultProps, DefaultState, object> {
  constructor(props: any) {
    super(props);

    this.state = {
      talkSession: null,
    };
  }

  async componentDidMount() {
    const session = await talkSession.get();

    this.setState({
      talkSession: session,
    });

    destroyAllPopups();
  }

  public render() {
    return (
      <div style={{ marginTop: 40 }}>
        <Inbox loadingMessage="Loading chats..." height={505} session={this.state.talkSession} />
      </div>
    );
  }
}

export default InboxPageContainer;
