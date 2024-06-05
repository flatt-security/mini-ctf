pushd /app/cdk
    if [ ! -d "node_modules" ]; then
        cdk init app --language=typescript --generate-only
        npm install --save-dev eslint 
        npm install --save-dev @typescript-eslint/parser
        npm install --save-dev @typescript-eslint/eslint-plugin
        npm install --save-dev eslint-config-prettier
        npm install --save-dev prettier
        npm install --save-dev @types/aws-lambda
        npm install --save-dev esbuild@0
    fi
popd
