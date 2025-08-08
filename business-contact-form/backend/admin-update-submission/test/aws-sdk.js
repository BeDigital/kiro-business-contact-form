class DocumentClient {
  update() {
    return {
      promise: () => Promise.reject({ code: 'ConditionalCheckFailedException' })
    };
  }
}

module.exports = {
  DynamoDB: { DocumentClient }
};
