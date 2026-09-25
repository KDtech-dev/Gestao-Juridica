<?php

namespace App\Notifications\Messages;

class WhatsAppMessage
{
    public ?string $to = null;
    public string $content = '';

    public static function create(): self
    {
        return new self();
    }

    public function to(string $to): self
    {
        $this->to = $to;

        return $this;
    }

    public function content(string $content): self
    {
        $this->content = $content;

        return $this;
    }
}