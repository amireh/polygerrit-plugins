// TODO: we don't really need all of this, just expose two functions that
// calculate the target cursor within a list given a target
export default function LinkedList($, set) {
  this.$ = $;
  this.$set = $(set);
  this.setCursor(0);

  return this;
};

LinkedList.prototype.setCursor = function(cursor) {
  if (cursor instanceof this.$) {
    cursor = this.$set.index( cursor );
  }

  this.cursor = cursor;
  this.$cursor = this.$(this.$set.get(this.cursor));

  return this;
};

LinkedList.prototype.getNext = function(originalCursor) {
  if (originalCursor) {
    this.setCursor(originalCursor);
  }

  this.setCursor(this.canGoForward() ? this.cursor + 1 : 0);

  return this.$cursor;
};

LinkedList.prototype.canGoForward = function() {
  return this.$set.length > 1 && this.cursor !== this.$set.length - 1;
};

LinkedList.prototype.canGoBack = function() {
  return this.$set.length > 1 && this.cursor !== 0;
};

LinkedList.prototype.getPrevious = function(originalCursor) {
  if (originalCursor) {
    this.setCursor(originalCursor);
  }

  this.setCursor(this.canGoBack() ? this.cursor - 1 : this.$set.length - 1);

  return this.$cursor;
};
