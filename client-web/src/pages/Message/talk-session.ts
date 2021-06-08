import Talk from 'talkjs';

import { Deferred } from './deferred.util';
import { appId, createTalkUser } from './talk.util';

const sessionDeferred = new Deferred<Talk.Session>();
type User = API.Employee;

export async function initialize(user: User) {
  await Talk.ready;

  sessionDeferred.resolve(
    new Talk.Session({
      appId,
      me: await createTalkUser(user),
    }),
  );
}

export function get(): Promise<Talk.Session> {
  return sessionDeferred.promise;
}
