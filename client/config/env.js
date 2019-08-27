const devel = {
    BLOCKCHAIN_NODE_URL: 'http://192.168.1.57:4000',
    DEBUG: true,
};

const prod = {
    BLOCKCHAIN_NODE_URL: 'http://localhost:4001',
    DEBUG: false,
};

const env = __DEV__ ? devel : prod;

module.exports = {
    env
};
