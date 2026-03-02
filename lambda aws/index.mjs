import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN || '*',
    'Access-Control-Allow-Headers': process.env.CORS_ALLOW_HEADERS || 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Origin',
    'Access-Control-Allow-Methods': process.env.CORS_ALLOW_METHODS || 'OPTIONS,POST',
    'Content-Type': 'application/json'
};

export const handler = async (event) => {
    // Always return CORS headers for OPTIONS requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        // Handle both direct invocation and API Gateway events
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        
        const { code, language, input } = body;
        
        if (!code || !language) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'Code and language are required'
                })
            };
        }
        
        // Create temporary directory in /tmp (only writable directory in Lambda)
        const tempDir = path.join('/tmp', 'code_' + Date.now());
        await fs.mkdir(tempDir, { recursive: true });
        
        let output = '';
        
        switch (language.toLowerCase()) {
            case 'javascript':
                output = await executeJavaScript(code, input, tempDir);
                break;
                
            case 'python':
                output = await executePython(code, input, tempDir);
                break;
                
            case 'c++':
                output = await executeCpp(code, input, tempDir);
                break;
                
            case 'java':
                output = await executeJava(code, input, tempDir);
                break;
                
            default:
                throw new Error('Unsupported language');
        }
        
        // Clean up temp files
        await fs.rm(tempDir, { recursive: true, force: true }).catch(console.error);
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                output: output
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: error.message,
                details: error.stack
            })
        };
    }
};

// Execution functions
async function executeJavaScript(code, input, tempDir) {
    const filename = path.join(tempDir, 'code.js');
    const inputFile = path.join(tempDir, 'input.txt');
    
    await fs.writeFile(filename, code);
    await fs.writeFile(inputFile, input);
    
    try {
        const { stdout, stderr } = await execAsync(`node ${filename} < ${inputFile}`, {
            shell: true,
            encoding: 'utf-8',
            timeout: 10000
        });
        return stdout || stderr;
    } catch (error) {
        throw new Error(`JavaScript execution error: ${error.message}`);
    }
}

async function executePython(code, input, tempDir) {
    const filename = path.join(tempDir, 'code.py');
    const inputFile = path.join(tempDir, 'input.txt');
    
    await fs.writeFile(filename, code);
    await fs.writeFile(inputFile, input);
    
    try {
        const { stdout, stderr } = await execAsync(`python3 ${filename} < ${inputFile}`, {
            shell: true,
            encoding: 'utf-8',
            timeout: 10000
        });
        return stdout || stderr;
    } catch (error) {
        throw new Error(`Python execution error: ${error.message}`);
    }
}

async function executeCpp(code, input, tempDir) {
    const sourceFile = path.join(tempDir, 'code.cpp');
    const outputFile = path.join(tempDir, 'code.out');
    
    await fs.writeFile(sourceFile, code);
    
    try {
        // Compile
        await execAsync(`g++ ${sourceFile} -o ${outputFile}`);
        
        // Create input file
        const inputFile = path.join(tempDir, 'input.txt');
        await fs.writeFile(inputFile, input);
        
        // Execute with input redirection
        const { stdout, stderr } = await execAsync(`${outputFile} < ${inputFile}`, {
            shell: true,
            encoding: 'utf-8',
            timeout: 10000
        });
        
        return stdout || stderr;
    } catch (error) {
        throw new Error(`C++ compilation/execution error: ${error.message}`);
    }
}

async function executeJava(code, input, tempDir) {
    const classMatch = code.match(/public\s+class\s+(\w+)/);
    if (!classMatch) {
        throw new Error('No public class found in Java code');
    }
    
    const className = classMatch[1];
    const sourceFile = path.join(tempDir, `${className}.java`);
    const inputFile = path.join(tempDir, 'input.txt');
    
    await fs.writeFile(sourceFile, code);
    await fs.writeFile(inputFile, input);
    
    try {
        await execAsync(`javac ${sourceFile}`);
        const { stdout, stderr } = await execAsync(`java -cp ${tempDir} ${className} < ${inputFile}`, {
            shell: true,
            encoding: 'utf-8',
            timeout: 10000
        });
        return stdout || stderr;
    } catch (error) {
        throw new Error(`Java compilation/execution error: ${error.message}`);
    }
} 