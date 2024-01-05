module.exports = {
    presets: [
        [
            '@babel/preset-react',
            {
                pragma: 'Didact.createElement' // default pragma is React.createElement (only in classic runtime)
            }
        ]
    ]
}