<?php

class SiteController extends Controller
{
    public function actionUpload()
    {
        header('Content-Type: application/json');
        $errors = [];
        $rowNumber = 3;

        if (isset($_FILES['csv_file'])) { 
            $file = CUploadedFile::getInstanceByName('csv_file');

            if ($file && $file->getExtensionName() === 'csv') {
                $filePath = Yii::getPathOfAlias('webroot') . '/uploads/' . $file->getName();

                if ($file->saveAs($filePath)) {
                    $data = [];
                    if (($handle = fopen($filePath, 'r')) !== false) {
                        fgetcsv($handle, 1000, ",");
                        fgetcsv($handle, 1000, ",");

                        while (($row = fgetcsv($handle, 1000, ",")) !== false) { 

                            $rowErrors = []; 
                            if (!$this->validateRow($row, $rowErrors, $rowNumber)) { 
                                foreach ($rowErrors as &$error) {
                                    $error = "Linha $rowNumber: $error"; 
                                }
                                $errors = array_merge($errors, $rowErrors); 
                            }
                            $data[] = $row;
                            $rowNumber++;
                        }
                        fclose($handle);
                    }
                    echo json_encode(empty($errors) ? $data : ['errors' => $errors]);
                    Yii::app()->end();
                } else {
                    echo json_encode(['error' => 'Falha ao salvar o arquivo.']);
                }
            } else {
                echo json_encode(['error' => 'Arquivo CSV inválido.']);
            }
        } else {
            echo json_encode(['error' => 'Nenhum arquivo foi enviado.']);
        }
    }


    private function validateRow($row, &$rowErrors, $rowNumber) 
    {
        $errorPrefix = ""; // Remova o prefixo aqui
        $cpf = trim($row[7]);
        $cnpj = trim($row[6]);
        $hasCnpj = !empty($cnpj) && preg_match('/^\d{14}$/', str_replace(['.', '/', '-'], '', $cnpj));
        $hasCpf = !empty($cpf) && preg_match('/^\d{11}$/', str_replace(['.', '-', ' '], '', $cpf));


        if (empty($cpf) && empty($cnpj)) {
            $rowErrors[] = "CNPJ ou CPF é obrigatório.";
        } elseif (!$hasCnpj && !empty($cnpj)) {
            $rowErrors[] = "CNPJ inválido: " . $cnpj;
        } elseif (!$hasCpf && !empty($cpf)) {
            $rowErrors[] = "CPF inválido: " . $cpf;
        }


        if (empty($row[1])) {
            $rowErrors[] = "O dia de vencimento é obrigatório.";
        } elseif ($row[1] < 1 || $row[1] > 31) {
            $rowErrors[] = "O dia de vencimento deve ser entre 1 e 31.";
        }


        $emails = explode(';', $row[10]);
        foreach ($emails as $email) {
            if (!filter_var(trim($email), FILTER_VALIDATE_EMAIL)) {
                $rowErrors[] = "E-mail de financeiro inválido: " . trim($email);
            }
        }


        if (!is_numeric($row[49]) || intval($row[49]) <= 0) {
            $rowErrors[] = "ID da Unidade inválido.";
        }


        $validMaritalStatuses = ['C', 'S', 'D', 'V'];
        if (!in_array(trim($row[47]), $validMaritalStatuses)) {
            $rowErrors[] = "Estado civil inválido. Valores permitidos: C (Casado), S (Solteiro), D (Divorciado), V (Viúvo).";
        }


        if (!preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $row[5])) {
            $rowErrors[] = "Data de nascimento ou fundação inválida. Use o formato dd/mm/aaaa.";
        }


        $requiredFields = [
            'Dia de vencimento' => $row[1],        
            'Nome completo' => $row[2],            
            'Rua' => $row[17],                    
            'Número' => $row[18],                 
            'Complemento' => $row[19],             
            'Bairro' => $row[20],                   
            'CEP' => $row[21],                   
            'Cidade' => $row[22],                
            'Estado (UF)' => trim($row[23]),     
            'Celular' => trim($row[13]),           
            'E-mail de financeiro' => trim($row[10]), 
        ];

        foreach ($requiredFields as $fieldName => $value) {
            if (empty(trim($value))) {
                $rowErrors[] = "$fieldName é obrigatório.";
            }
        }

        return empty($rowErrors); 
    }

    public function actionIndex()
    {
        $this->render('upload');
    }

    public function actionError()
    {
        if ($error = Yii::app()->errorHandler->error) {
            if (Yii::app()->request->isAjaxRequest)
                echo $error['message'];
            else
                $this->render('error', $error);
        }
    }
}
