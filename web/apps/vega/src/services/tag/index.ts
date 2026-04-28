import Request from '../request';
import * as TagType from './type';

const TAG_BASE_URL = '/api/mdl-data-model/v1/object-tags';

export const getObjectTags = async (params: TagType.GetObjectTagsParams = {}): Promise<TagType.TagList> => {
  const { sort = 'tag', direction = 'asc', limit = -1, ...rest } = params;

  return Request.get(TAG_BASE_URL, {
    sort,
    direction,
    limit,
    ...rest,
  });
};

export default {
  getObjectTags,
};
