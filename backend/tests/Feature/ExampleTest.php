<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        if (!extension_loaded('pdo_sqlite')) {
            $this->markTestSkipped('The pdo_sqlite extension is required.');
        }

        parent::setUp();
    }

    public function test_public_categories_endpoint_returns_a_successful_response(): void
    {
        $response = $this->get('/api/categorias');

        $response->assertStatus(200);
    }
}
