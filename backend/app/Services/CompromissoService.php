<?php

namespace App\Services;

use App\Models\Compromisso;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CompromissoService
{
    public function listar(bool $somenteDoUsuario = false)
    {
        $query = Compromisso::query()
            ->with('criador')
            ->orderBy('data')
            ->orderBy('hora');

        if ($somenteDoUsuario) {
            $query->where('user_id', Auth::id());
        }

        return $query->get();
    }

    public function criar(array $dados): Compromisso
    {
        if (isset($dados['anexo']) && $dados['anexo'] instanceof UploadedFile) {
            $dados['anexo'] = $dados['anexo']
                ->store('compromissos', 'public');
        }

        $dados['user_id'] =  Auth::id();

        return Compromisso::create($dados);
    }

    public function atualizar(
        Compromisso $compromisso,
        array $dados
    ): Compromisso {
        if (isset($dados['anexo']) && $dados['anexo'] instanceof UploadedFile) {

            if ($compromisso->anexo) {
                Storage::disk('public')
                    ->delete($compromisso->anexo);
            }

            $dados['anexo'] = $dados['anexo']
                ->store('compromissos', 'public');
        }

        $compromisso->update($dados);

        return $compromisso;
    }

    public function deletar(Compromisso $compromisso): void
    {
        if ($compromisso->anexo) {
            Storage::disk('public')
                ->delete($compromisso->anexo);
        }

        $compromisso->delete();
    }
}
