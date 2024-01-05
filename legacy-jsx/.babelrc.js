module.exports = {
    presets: [
        [
            '@babel/preset-react',
            {
                pragma: 'createElement' // default pragma is React.createElement (only in classic runtime)
            }
        ]
    ]
}