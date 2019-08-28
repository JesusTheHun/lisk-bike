const devel = {
    BLOCKCHAIN_NODE_URL: 'http://192.168.1.57:4000',
    DEBUG: true,
};

const prod = {
    BLOCKCHAIN_NODE_URL: 'http://localhost:4001',
    DEBUG: false,
};

const shared = {
    primaryColor: '#0056ED',
    secondaryColor: 'transparent',
};

const env = Object.assign({}, shared, __DEV__ ? devel : prod);

module.exports = {
    env
};
