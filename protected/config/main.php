<?php

// uncomment the following to define a path alias
// Yii::setPathOfAlias('local', 'path/to/local-folder');

// This is the main Web application configuration. Any writable
// CWebApplication properties can be configured here.
return array(
    'basePath' => dirname(__FILE__) . DIRECTORY_SEPARATOR . '..', // Caminho base da aplicação
    'name' => 'Projeto Academy', // Nome da aplicação

    // Preloading 'log' component
    'preload' => array('log'), // Carregar o componente de log antes da inicialização

    // Autoloading model and component classes
    'import' => array(
        'application.models.*', // Importa todos os modelos
        'application.components.*', // Importa todos os componentes
    ),

    'modules' => array(
        // Uncomment the following to enable the Gii tool
        /*
        'gii' => array(
            'class' => 'system.gii.GiiModule', // Módulo Gii para geração de código
            'password' => 'Enter Your Password Here', // Defina uma senha para acessar o Gii
            // If removed, Gii defaults to localhost only. Edit carefully to taste.
            'ipFilters' => array('127.0.0.1', '::1'), // Permite acesso apenas a localhost
        ),
        */
    ),

    // Application components
    'components' => array(

        'user' => array(
            // Enable cookie-based authentication
            'allowAutoLogin' => true, // Permite que o usuário permaneça logado através de cookies
        ),

        'urlManager' => array(
            'urlFormat' => 'path', // Define o formato das URLs
            'rules' => array(
                'upload' => 'site/upload',      // Mapeia a rota /upload para a ação upload
                'uploadCsv' => 'site/uploadCsv' // Mapeia a rota /uploadCsv para a ação uploadCsv
            ),
            'showScriptName' => false,  // Remove o index.php da URL
        ),

        // Database settings are configured in database.php
        'db' => require(dirname(__FILE__) . '/database.php'), // Inclui configurações de banco de dados

        'errorHandler' => array(
            // Use 'site/error' action to display errors
            'errorAction' => YII_DEBUG ? null : 'site/error', // Redireciona erros para a ação 'site/error' em produção
        ),

        'log' => array(
            'class' => 'CLogRouter', // Classe para gerenciamento de logs
            'routes' => array(
                array(
                    'class' => 'CFileLogRoute', // Log para arquivo
                    'levels' => 'error, warning', // Níveis de log a serem gravados
                ),
                // Uncomment the following to show log messages on web pages
                /*
                array(
                    'class' => 'CWebLogRoute', // Log na interface web
                ),
                */
            ),
        ),

    ),

    // Application-level parameters that can be accessed
    // using Yii::app()->params['paramName']
    'params' => array(
        // This is used in contact page
        'adminEmail' => 'webmaster@example.com', // E-mail do administrador
    ),
);
