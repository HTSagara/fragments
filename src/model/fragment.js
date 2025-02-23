// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

// const MarkdownIt = require('markdown-it');
// const md = new MarkdownIt();

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    // TODO
    if (!ownerId || !type) {
      throw new Error('ownerId and type are required');
    }
    if (typeof size !== 'number') {
      throw new Error('size must be a number');
    }
    if (size < 0) {
      throw new Error('size cannot be negative');
    }
    if (!Fragment.isSupportedType(type)) {
      throw new Error(`Invalid type: ${type}`);
    }

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    // TODO
    const result = await listFragments(ownerId, expand);
    return result;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    // TODO
    const fragmentData = await readFragment(ownerId, id);
    if (!fragmentData) throw new Error(`Fragment not found: ownerId=${ownerId}, id=${id}`);
    return new Fragment(fragmentData);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    // TODO
    deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  async save() {
    // TODO
    await writeFragment(this);
    this.updated = new Date().toISOString();
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  async getData() {
    // TODO
    return await readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    // TODO
    if (!(data instanceof Buffer)) {
      throw new Error('setData expects a Buffer');
    }
    this.size = data.length;
    await writeFragmentData(this.ownerId, this.id, data);
    this.updated = new Date().toISOString();
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    // TODO
    return this.type.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    const formats = [this.mimeType];
    if (this.type === 'text/markdown') {
      formats.push('text/html');
    }
    return formats;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const { type } = contentType.parse(value);
    return [
      'text/plain',
      'text/markdown',
      'text/html',
      'text/csv',
      'application/json',
      'application/yaml',
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/avif',
      'image/gif',
    ].includes(type);
  }

  // /**
  //  * Convert fragment data to a specified format
  //  * @param {string} format the format to convert to (e.g., 'html')
  //  * @returns {Buffer}
  //  */
  // async convertTo(format) {
  //   const data = await this.getData();
  //   if (this.type === 'text/markdown' && format === 'html') {
  //     const html = md.render(data.toString());
  //     return Buffer.from(html);
  //   }
  //   throw new Error(`Unsupported conversion: ${this.type} to ${format}`);
  // }
}

module.exports.Fragment = Fragment;
