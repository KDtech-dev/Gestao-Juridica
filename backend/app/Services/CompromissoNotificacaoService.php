<?

use App\Models\Compromisso;
use App\Notifications\CompromissoHojeNotification;
use Carbon\Carbon;

class CompromissoNotificacaoService
{
    public function notificarCompromissosDeHoje(): void
    {
        $compromissos = Compromisso::query()
            ->whereDate('data', Carbon::today())
            ->with('criador')
            ->get();

        foreach ($compromissos as $compromisso) {
            $compromisso->criador?->notify(
                new CompromissoHojeNotification($compromisso)
            );
        }
    }
}
